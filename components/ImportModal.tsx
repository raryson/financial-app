"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { db } from "@/lib/db.client";
import { parseNubankCSV } from "@/lib/categorize";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface FileStatus {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  imported?: number;
  error?: string;
}

export default function ImportModal({ onClose, onSuccess }: Props) {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: FileList | File[]) {
    const csvFiles = Array.from(incoming).filter((f) => f.name.endsWith(".csv"));
    if (!csvFiles.length) return;
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.file.name));
      const newOnes = csvFiles
        .filter((f) => !existing.has(f.name))
        .map((f) => ({ file: f, status: "pending" as const }));
      return [...prev, ...newOnes];
    });
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.file.name !== name));
  }

  async function handleImport() {
    if (!files.length) return;
    setLoading(true);

    for (const entry of files) {
      if (entry.status === "done") continue;

      setFiles((prev) =>
        prev.map((f) => f.file.name === entry.file.name ? { ...f, status: "uploading" } : f)
      );

      try {
        const text = await entry.file.text();
        const transactions = parseNubankCSV(text);

        if (!transactions.length) {
          setFiles((prev) =>
            prev.map((f) =>
              f.file.name === entry.file.name
                ? { ...f, status: "error", error: "Nenhuma transação encontrada" }
                : f
            )
          );
          continue;
        }

        await db.transactions.bulkAdd(transactions);

        setFiles((prev) =>
          prev.map((f) =>
            f.file.name === entry.file.name
              ? { ...f, status: "done", imported: transactions.length }
              : f
          )
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.file.name === entry.file.name
              ? { ...f, status: "error", error: "Erro ao processar arquivo" }
              : f
          )
        );
      }
    }

    setLoading(false);
    setDone(true);
    onSuccess();
  }

  const totalImported = files.reduce((s, f) => s + (f.imported ?? 0), 0);
  const allDone = files.length > 0 && files.every((f) => f.status === "done" || f.status === "error");
  const hasPending = files.some((f) => f.status === "pending");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Importar extratos Nubank</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-purple-50 rounded-xl p-4 flex gap-3">
            <Info size={16} className="text-purple-600 mt-0.5 shrink-0" />
            <div className="text-sm text-purple-800 space-y-1">
              <p className="font-medium">Como exportar do Nubank:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-purple-700">
                <li>Abra o app Nubank</li>
                <li>Vá em <strong>Cartão de Crédito</strong></li>
                <li>Selecione a fatura</li>
                <li>Toque em <strong>Exportar planilha</strong></li>
                <li>Salve o arquivo .csv</li>
              </ol>
            </div>
          </div>

          {!allDone && (
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                dragging
                  ? "border-purple-400 bg-purple-50"
                  : files.length
                  ? "border-purple-200 bg-purple-50/30 hover:border-purple-300"
                  : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addFiles(e.dataTransfer.files);
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
              />
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Upload size={28} />
                <p className="font-medium text-gray-600">
                  {files.length ? "Adicionar mais arquivos" : "Arraste os arquivos CSV aqui"}
                </p>
                <p className="text-xs">ou clique para selecionar — pode selecionar vários de uma vez</p>
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {files.map((entry) => (
                <div
                  key={entry.file.name}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <FileText size={16} className="text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{entry.file.name}</p>
                    {entry.status === "done" && (
                      <p className="text-xs text-green-600">{entry.imported} transações importadas</p>
                    )}
                    {entry.status === "error" && (
                      <p className="text-xs text-red-500">{entry.error}</p>
                    )}
                    {entry.status === "pending" && (
                      <p className="text-xs text-gray-400">{(entry.file.size / 1024).toFixed(1)} KB</p>
                    )}
                  </div>
                  {entry.status === "pending" && !loading && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(entry.file.name); }}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {entry.status === "uploading" && (
                    <Loader2 size={16} className="text-purple-500 animate-spin shrink-0" />
                  )}
                  {entry.status === "done" && (
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                  )}
                  {entry.status === "error" && (
                    <AlertCircle size={16} className="text-red-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}

          {done && allDone && (
            <div className="flex items-center gap-3 text-green-700 bg-green-50 rounded-xl p-4">
              <CheckCircle size={22} />
              <div>
                <p className="font-semibold">Importação concluída!</p>
                <p className="text-sm text-green-600">
                  {totalImported} transações importadas de {files.filter((f) => f.status === "done").length} arquivo(s)
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 pt-0">
          {allDone ? (
            <button
              onClick={onClose}
              className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Ver dashboard
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!hasPending || loading}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Importando..."
                  : `Importar ${files.length > 1 ? `${files.length} arquivos` : "arquivo"}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
