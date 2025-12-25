// InsForge Edge Function: 发送验证码邮件
// 使用 Resend API 发送邮件（免费额度：每月100封）

module.exports = async function(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '缺少必要参数' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 使用 Resend API 发送邮件
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_123456789';
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@resend.dev',
        to: email,
        subject: '【智能记账】邮箱验证码',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #6366F1, #8B5CF6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">智能记账</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">邮箱验证</p>
            </div>
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px;">
              <p style="color: #1e293b; font-size: 16px; margin-bottom: 20px;">您好！</p>
              <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">您正在注册智能记账账号，请使用以下验证码完成验证：</p>
              <div style="background: white; border: 2px dashed #6366F1; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; color: #6366F1; letter-spacing: 8px;">${code}</span>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
                • 验证码有效期为 5 分钟<br>
                • 如非本人操作，请忽略此邮件
              </p>
            </div>
          </div>
        `
      })
    });

    if (emailResponse.ok) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: '验证码已发送' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      const errorData = await emailResponse.text();
      console.error('Resend API error:', errorData);
      return new Response(JSON.stringify({ 
        success: false, 
        message: '邮件发送失败' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: '服务器错误' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
