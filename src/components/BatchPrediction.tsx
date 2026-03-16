import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { predict } from "@/services/prediction-engine";
import { PatientInput, PredictionResult } from "@/types/cardiorisk";

const REQUIRED_COLUMNS = ["age", "gender", "height", "weight", "ap_hi", "ap_lo", "cholesterol", "glucose", "smoke", "alco", "active"];

interface BatchRow {
  rowIndex: number;
  input: PatientInput | null;
  result: PredictionResult | null;
  error: string | null;
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  const rows = lines.slice(1).map(l => l.split(",").map(c => c.trim()));
  return { headers, rows };
}

function validateAndParse(headers: string[], row: string[], rowIndex: number): { input: PatientInput | null; error: string | null } {
  const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
  if (missing.length > 0) return { input: null, error: `Missing columns: ${missing.join(", ")}` };

  const get = (col: string) => {
    const idx = headers.indexOf(col);
    return idx >= 0 ? row[idx] : undefined;
  };

  const vals: Record<string, number> = {};
  for (const col of REQUIRED_COLUMNS) {
    const raw = get(col);
    if (raw === undefined || raw === "") return { input: null, error: `Row ${rowIndex}: missing value for "${col}"` };
    const num = Number(raw);
    if (isNaN(num)) return { input: null, error: `Row ${rowIndex}: invalid number for "${col}": "${raw}"` };
    vals[col] = num;
  }

  if (vals.age < 1 || vals.age > 120) return { input: null, error: `Row ${rowIndex}: age must be 1-120` };
  if (![1, 2].includes(vals.gender)) return { input: null, error: `Row ${rowIndex}: gender must be 1 or 2` };
  if (vals.height < 50 || vals.height > 250) return { input: null, error: `Row ${rowIndex}: height must be 50-250 cm` };
  if (vals.weight < 20 || vals.weight > 300) return { input: null, error: `Row ${rowIndex}: weight must be 20-300 kg` };

  return {
    input: {
      age: vals.age,
      gender: vals.gender,
      height: vals.height,
      weight: vals.weight,
      ap_hi: vals.ap_hi,
      ap_lo: vals.ap_lo,
      cholesterol: vals.cholesterol,
      gluc: vals.glucose,
      smoke: vals.smoke,
      alco: vals.alco,
      active: vals.active,
    },
    error: null,
  };
}

export function BatchPrediction() {
  const [results, setResults] = useState<BatchRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const summary = results.length > 0 ? {
    total: results.length,
    highRisk: results.filter(r => r.result?.prediction === "High Risk").length,
    lowRisk: results.filter(r => r.result?.prediction === "Low Risk").length,
    errors: results.filter(r => r.error).length,
  } : null;

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setProcessing(true);
    const text = await file.text();
    const { headers, rows } = parseCSV(text);

    if (rows.length === 0) {
      setResults([{ rowIndex: 1, input: null, result: null, error: "CSV file is empty or has no data rows" }]);
      setProcessing(false);
      return;
    }

    const batchResults: BatchRow[] = [];
    for (let i = 0; i < rows.length; i++) {
      const { input, error } = validateAndParse(headers, rows[i], i + 2);
      if (error || !input) {
        batchResults.push({ rowIndex: i + 2, input: null, result: null, error });
      } else {
        const result = predict(input);
        batchResults.push({ rowIndex: i + 2, input, result, error: null });
      }
    }

    setResults(batchResults);
    setProcessing(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) handleFile(file);
  }, [handleFile]);

  const downloadCSV = useCallback(() => {
    const header = "Row,Age,Gender,Height,Weight,BMI,BP,Cholesterol,Glucose,Smoke,Alco,Active,Prediction,Probability,Confidence,Top Factor\n";
    const rows = results
      .filter(r => r.result)
      .map(r => {
        const res = r.result!;
        const inp = res.input;
        return `${r.rowIndex},${inp.age},${inp.gender === 1 ? "M" : "F"},${inp.height},${inp.weight},${res.bmi},${inp.ap_hi}/${inp.ap_lo},${inp.cholesterol},${inp.gluc},${inp.smoke},${inp.alco},${inp.active},${res.prediction},${res.probability}%,${res.confidence}%,"${res.top_factors[0] || ""}"`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batch_predictions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const reset = () => {
    setResults([]);
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-card rounded-2xl shadow-card border border-border/50 p-6 space-y-5"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Batch Prediction
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">Upload a CSV with multiple patients for bulk risk analysis</p>
        </div>
        {results.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reset}>
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
            {summary && summary.errors < summary.total && (
              <Button size="sm" onClick={downloadCSV}>
                <Download className="w-4 h-4 mr-1" /> Download Results
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload area */}
      {results.length === 0 && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {processing ? (
            <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium">Drop CSV here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">
                Required columns: {REQUIRED_COLUMNS.join(", ")}
              </p>
            </>
          )}
        </div>
      )}

      {/* Summary cards */}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <div className="text-2xl font-display font-bold text-foreground">{summary.total}</div>
              <div className="text-xs text-muted-foreground">Total Records</div>
            </div>
            <div className="rounded-xl bg-danger/5 border border-danger/10 p-3 text-center">
              <div className="text-2xl font-display font-bold text-danger">{summary.highRisk}</div>
              <div className="text-xs text-muted-foreground">High Risk</div>
            </div>
            <div className="rounded-xl bg-success/5 border border-success/10 p-3 text-center">
              <div className="text-2xl font-display font-bold text-success">{summary.lowRisk}</div>
              <div className="text-xs text-muted-foreground">Low Risk</div>
            </div>
            <div className="rounded-xl bg-warning/5 border border-warning/10 p-3 text-center">
              <div className="text-2xl font-display font-bold text-warning">{summary.errors}</div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results table */}
      {results.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Row</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Patient</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">BMI</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Risk</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Probability</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Confidence</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Top Factor</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  {row.error ? (
                    <td colSpan={7} className="px-4 py-3 text-danger text-xs flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {row.error}
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-foreground">{row.rowIndex}</td>
                      <td className="px-4 py-3 text-foreground">
                        {row.result!.input.gender === 1 ? "M" : "F"}, {row.result!.input.age}y, BP {row.result!.input.ap_hi}/{row.result!.input.ap_lo}
                      </td>
                      <td className="text-center px-4 py-3 text-foreground">{row.result!.bmi}</td>
                      <td className="text-center px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.result!.prediction === "High Risk"
                            ? "bg-danger/10 text-danger"
                            : "bg-success/10 text-success"
                        }`}>
                          {row.result!.prediction === "High Risk"
                            ? <AlertTriangle className="w-3 h-3" />
                            : <CheckCircle className="w-3 h-3" />}
                          {row.result!.prediction}
                        </span>
                      </td>
                      <td className="text-center px-4 py-3 font-semibold text-foreground">{row.result!.probability}%</td>
                      <td className="text-center px-4 py-3 text-foreground">{row.result!.confidence}%</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{row.result!.top_factors[0] || "—"}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* File info */}
      {fileName && (
        <p className="text-xs text-muted-foreground text-right">
          Source: {fileName}
        </p>
      )}
    </motion.div>
  );
}
