"use client";

import { useState } from "react";
import { Sparkles, Image as ImageIcon, Send, CalendarClock, MessageSquareText } from "lucide-react";

export default function Home() {
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [formData, setFormData] = useState({
    messageText: "",
    aiPrompt: "",
    intervalMinutes: "10",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create FormData to send to our API route soon
      const payload = new FormData();
      payload.append("isAiEnabled", String(isAiEnabled));
      payload.append("intervalMinutes", formData.intervalMinutes);

      if (isAiEnabled) {
        payload.append("aiPrompt", formData.aiPrompt);
      } else {
        payload.append("messageText", formData.messageText);
        if (imageFile) {
          payload.append("image", imageFile);
        }
      }

      // We will create the API route at /api/schedule
      const res = await fetch("/api/schedule", {
        method: "POST",
        body: payload,
      });

      if (res.ok) {
        alert("Agendamento criado com sucesso!");
        // Reset form
        setFormData({ messageText: "", aiPrompt: "", intervalMinutes: "10" });
        setImageFile(null);
        setPreviewUrl(null);
        setIsAiEnabled(false);
      } else {
        const data = await res.json().catch(() => null);
        alert(`Erro ao agendar a mensagem (HTTP ${res.status}): ${data?.error ?? res.statusText}`);
      }
    } catch (err) {
      console.error(err);
      // "Failed to fetch" aqui significa que o servidor não respondeu:
      // servidor parado ou aba aberta em outra porta.
      alert(
        "Não foi possível falar com o servidor. Verifique se o 'npm run dev' está rodando e se a página está aberta na porta correta."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mb-2">
            Disparador Inteligente
          </h1>
          <p className="text-slate-400 text-sm">
            Agende mensagens para o WhatsApp através do n8n, com o poder da IA.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 transition-all hover:bg-slate-800/60">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isAiEnabled ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-700 text-slate-400'}`}>
                <Sparkles size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-200">Gerar com Inteligência Artificial</p>
                <p className="text-xs text-slate-400">Deixe o ChatGPT criar o texto e a imagem.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isAiEnabled}
                onChange={() => setIsAiEnabled(!isAiEnabled)}
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
            </label>
          </div>

          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isAiEnabled ? (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 ml-1">
                  <Sparkles size={16} className="text-violet-400" /> Prompt para a IA
                </label>
                <textarea
                  name="aiPrompt"
                  required
                  value={formData.aiPrompt}
                  onChange={handleInputChange}
                  placeholder="Ex: Crie uma mensagem curta convidando para uma live sobre vendas, e uma imagem de um notebook com gráficos subindo."
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all resize-none h-32"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 ml-1">
                    <MessageSquareText size={16} className="text-blue-400" /> Mensagem de Texto
                  </label>
                  <textarea
                    name="messageText"
                    required
                    value={formData.messageText}
                    onChange={handleInputChange}
                    placeholder="Digite a mensagem que será enviada..."
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none h-32"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-300 ml-1">
                    <ImageIcon size={16} className="text-blue-400" /> Anexar Imagem (Opcional)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-950/30 hover:bg-slate-900/50 hover:border-blue-500/50 transition-all overflow-hidden group">
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-sm font-medium text-white bg-blue-500/80 px-3 py-1 rounded-lg backdrop-blur-sm">Alterar Imagem</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 group-hover:text-blue-400 transition-colors">
                        <ImageIcon size={28} className="mb-2" />
                        <p className="mb-1 text-sm font-semibold">Clique para fazer upload</p>
                        <p className="text-xs">PNG, JPG, JPEG</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 ml-1 mt-6">
                <CalendarClock size={16} className="text-pink-400" /> Intervalo entre disparos (em minutos)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                name="intervalMinutes"
                required
                value={formData.intervalMinutes}
                onChange={handleInputChange}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 mt-8 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <Send size={20} />
                Confirmar Agendamento no n8n
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
