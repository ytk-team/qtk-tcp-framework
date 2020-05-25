const genUuid = require('uuid').v1;
const HEAD_LENGTH = 45; //1 + 36 + 8
module.exports = class Message {
	static get SIGN_PING() { return 0x01; }
	static get SIGN_DATA() { return 0x11; }

	constructor(sign, payload = null, uuid = null) {
		this._sign = sign;
		this._payload = (payload === null) ? Buffer.from('') : payload;
		this._uuid = (uuid === null) ? genUuid() : uuid;
		this._rawBuffer = undefined;
	}

	get sign() { return this._sign; }
	get uuid() { return this._uuid; }
	get payload() { return this._payload; }
	get rawBuffer() { return this._rawBuffer; }
	set rawBuffer(rawBuffer) { this._rawBuffer = rawBuffer; }

	toBuffer() {
		let payloadLength = this._payload.length;
		let buffer = Buffer.alloc(HEAD_LENGTH + payloadLength);
		buffer.writeUInt8(this._sign, 0);
		buffer.write(this._uuid, 1);
		buffer.writeDoubleBE(payloadLength, 37);
		buffer.set(this._payload, HEAD_LENGTH);
		return buffer;
	}

	static parse(buffer) {
		if (buffer.length < HEAD_LENGTH) return { consumed: 0, message: null };
		let sign = buffer.readUInt8(0);
		let uuid = buffer.slice(1, 37);
		let length = buffer.readDoubleBE(37);

		if ((sign !== Message.SIGN_PING) && (sign !== Message.SIGN_DATA)) {
			throw new Error('expect packet to start with SIGN_PING || SIGN_DATA');
		}
		if (buffer.length < (HEAD_LENGTH + length)) return { consumed: 0, message: null };

		let payload = buffer.slice(HEAD_LENGTH, HEAD_LENGTH + length);

		let message = new Message(sign, payload, uuid.toString());
		message.rawBuffer = buffer.slice(0, HEAD_LENGTH + length);

		return { consumed: HEAD_LENGTH + length, message };
	}
}
