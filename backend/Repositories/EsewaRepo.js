import axios from "axios"
import QRCode from "qrcode"
import { ESEWA_CONFIG } from "../config/esewa.js"

export const generateEsewaPayment = async (payment) => {
    const formData = {
        amt: payment.amount,
        psc: 0,
        pdc: 0,
        txAmt: 0,
        tAmt: payment.amount,
        pid: payment._id.toString(),
        scd: ESEWA_CONFIG.MERCHANT_CODE,
        su: ESEWA_CONFIG.SUCCESS_URL,
        fu: ESEWA_CONFIG.FAILURE_URL,
    };

    // building esewa payment url 
    const query = new URLSearchParams(formData).toString();
    const paymentUrl = `${ESEWA_CONFIG.PAYMENT_URL}?${query}`;

    // generate a qr code 
    const qrCode = await QRCode.toDataURL(paymentUrl);
    return { paymentUrl, qrCode };
}

export const verifyEsewaTransaction = async (refId, paymentId, amount) => {
    const formData =
        new URLSearchParams({
            amt: amount,
            rid: refId,
            pid: paymentId,
            scd: ESEWA_CONFIG.MERCHANT_CODE,
        });
    const { data } = await axios.post(ESEWA_CONFIG.VERIFY_URL, formData);
    return data.includes("<response_code>Success</response_code>")
}
