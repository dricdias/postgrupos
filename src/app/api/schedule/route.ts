import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Ler os campos enviados do frontend
    const isAiEnabled = formData.get("isAiEnabled") === "true";
    const intervalMinutes = formData.get("intervalMinutes")?.toString() || "10";
    const aiPrompt = formData.get("aiPrompt")?.toString() || "";
    const messageText = formData.get("messageText")?.toString() || "";
    const image = formData.get("image") as File | null;

    let imageBase64: string | null = null;
    let mimeType: string | null = null;
    let fileName: string | null = null;

    // Converter a imagem para base64 se foi enviada (modo manual)
    if (image && image.size > 0) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageBase64 = buffer.toString("base64");
      mimeType = image.type || "image/jpeg";
      fileName = image.name || "imagem.jpg";
    }

    // Criar o payload JSON estruturado para enviar ao n8n
    const n8nPayload = {
      isAiEnabled,
      intervalMinutes: parseInt(intervalMinutes, 10),
      aiPrompt,
      messageText,
      image: imageBase64 ?? "",
      mimeType: mimeType ?? "",
      fileName: fileName ?? ""
    };

    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    
    if (!N8N_WEBHOOK_URL) {
      console.warn("N8N_WEBHOOK_URL não está configurada. Simulando sucesso local.");
      return NextResponse.json({ success: true, simulated: true, data: n8nPayload });
    }

    // Enviar dados para o webhook do n8n como JSON
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // O n8n já expõe o corpo da requisição em $json.body — não envolver em outro 'body'
      body: JSON.stringify(n8nPayload),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`n8n webhook error ${response.status}: ${detail || response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro na rota de agendamento:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao processar o agendamento." },
      { status: 500 }
    );
  }
}
