import { promisify } from 'util';

export default class CodeRepository {

    constructor(dataWriter, dataReader, dataRoot, baseUrl, fs, qrcode, jimp) {
        this.dataWriter = dataWriter;
        this.dataReader = dataReader;
        this.dataRoot = dataRoot;
        this.baseUrl = baseUrl;
        this.fs = fs;
        this.qrcode = qrcode;
        this.jimp = jimp;
    }

    async createOrUpdate(codes) {
        const codesData = codes.filter(code => code.num && code.key)
            .map(code => ({ key: code.key, num: code.num }));
        await this.dataWriter.write('', 'codes', codesData);
        const codeImagesDir = `${this.dataRoot}/code_images`;
        if (await promisify(this.fs.exists)(codeImagesDir))
            await promisify(this.fs.rmdir)(codeImagesDir, { recursive: true });
        await promisify(this.fs.mkdir)(codeImagesDir, { recursive: true });
        await Promise.all(codesData.map(code => this.createImage(code, codeImagesDir)));
    }

    async createImage(code, codeImagesDir) {
        const imageFile = `${codeImagesDir}/${code.key}.png`;
        const url = `${this.baseUrl}/${code.key}`
        await this.qrcode.toFile(imageFile, url);
        const image = await this.jimp.read(imageFile);
        const font = await this.jimp.loadFont(this.jimp.FONT_SANS_16_BLACK);
        const printOptions = {text: `${code.num}`, alignmentX: this.jimp.HORIZONTAL_ALIGN_CENTER };
        image.print(font, 0, image.bitmap.height - 16, printOptions, 
            image.bitmap.width, image.bitmap.height).write(imageFile);
    }

    async getCodeByKey(codeKey) {
        const codes = await this.getCodes();
        const matches = codes.filter(code => code.key === codeKey);
        return matches.length ? matches[0] : null;
    }

    async getCodes() {
        const codes = await this.dataReader.read('', 'codes');
        return codes ? codes : [];
    }

    getCodesSync() {
        const codes = this.dataReader.readSync('', 'codes');
        return codes ? codes : [];
    }
}