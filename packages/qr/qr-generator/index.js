const QRCode = require('qrcode');

async function main(args) {

  // ✅ CORS HEADERS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // ✅ PREFLIGHT (CORS) İSTEĞİ
  if (args.__ow_method === 'options') {
    return {
      statusCode: 204,
      headers: corsHeaders
    };
  }

  try {
    const text = args.text || args.url;
    const size = args.size || 300;
    const format = args.format || 'base64';

    if (!text) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        body: {
          error: 'Lütfen "text" veya "url" parametresi gönderin',
          example: { text: 'https://digitalocean.com' }
        }
      };
    }

    const margin = args.margin !== undefined ? parseInt(args.margin) : 1;
    const errorCorrectionLevel = ['L', 'M', 'Q', 'H'].includes(args.errorCorrectionLevel)
      ? args.errorCorrectionLevel
      : 'M';

    const options = {
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: args.color || '#000000',
        light: args.background || '#FFFFFF'
      }
    };

    // 🔹 BASE64 (DEFAULT)
    if (format === 'base64') {
      const qrData = await QRCode.toDataURL(text, options);
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        body: {
          success: true,
          text,
          format: 'base64',
          qrCode: qrData
        }
      };
    }

    // 🔹 SVG
    if (format === 'svg') {
      const qrData = await QRCode.toString(text, { ...options, type: 'svg' });
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "image/svg+xml"
        },
        body: qrData
      };
    }

    // 🔹 PNG (binary)
    if (format === 'png') {
      const buffer = await QRCode.toBuffer(text, options);
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "image/png"
        },
        body: buffer.toString('base64'),
        isBase64Encoded: true
      };
    }

    return {
      statusCode: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      body: {
        error: 'Geçersiz format',
        allowed: ['base64', 'svg', 'png']
      }
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      body: {
        error: 'QR kod oluşturulurken hata oluştu',
        details: err.message
      }
    };
  }
}

exports.main = main;
