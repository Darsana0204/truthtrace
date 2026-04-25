"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("media", file);

    try {
      const res = await axios.post(
        "https://truthtrace-xgrj.onrender.com/upload",
        formData
      );

      setResult(res.data);
    } catch (error) {
      setResult({
        status: "error",
        message: "Upload failed. Please try again.",
      });
    }

    setLoading(false);
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return "Low Risk";
    if (score >= 50) return "Medium Risk";
    return "High Risk";
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            TruthTrace
          </h1>

          <p className="text-xl text-gray-300 mb-3">
            AI-Powered Digital Content Ownership & Misuse Detection
          </p>

          <p className="text-gray-400 max-w-3xl mx-auto">
            Track every copy. Protect every creation. Detect unauthorized
            use, reposts, edits, and copyright violations using AI
            fingerprinting + Gemini intelligence.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="border border-zinc-700 rounded-2xl p-6 bg-zinc-950">
            <p className="text-gray-400 text-sm mb-2">Assets Protected</p>
            <h2 className="text-3xl font-bold">1,248+</h2>
          </div>

          <div className="border border-zinc-700 rounded-2xl p-6 bg-zinc-950">
            <p className="text-gray-400 text-sm mb-2">
              Violations Detected
            </p>
            <h2 className="text-3xl font-bold">327</h2>
          </div>

          <div className="border border-zinc-700 rounded-2xl p-6 bg-zinc-950">
            <p className="text-gray-400 text-sm mb-2">AI Accuracy</p>
            <h2 className="text-3xl font-bold">96%</h2>
          </div>
        </div>

        {/* Upload + Result Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Card */}
          <div className="border border-zinc-700 rounded-3xl p-8 bg-zinc-950 shadow-xl">
            <h2 className="text-2xl font-bold mb-3">Upload Media</h2>

            <p className="text-gray-400 mb-6">
              Upload image or video content for AI ownership verification.
            </p>

<div className="border-2 border-dashed border-zinc-600 rounded-2xl p-8 text-center cursor-pointer hover:border-white transition">
  <p className="text-lg font-medium">Click to Upload Media</p>

  <p className="text-sm text-gray-400 mt-2">
    Images, videos, documents supported
  </p>

  <input
    type="file"
    id="fileUpload"
    onChange={(e) => setFile(e.target.files?.[0] || null)}
    className="hidden"
  />

  <label
    htmlFor="fileUpload"
    className="inline-block mt-4 bg-white text-black px-6 py-3 rounded-2xl font-semibold cursor-pointer"
  >
    Select File
  </label>

  {file && (
    <p className="mt-4 text-sm text-gray-300">
      Selected File: <span className="font-semibold">{file.name}</span>
    </p>
  )}
</div>

            <button
              onClick={handleUpload}
              className="w-full bg-white text-black py-3 rounded-2xl font-semibold hover:scale-[1.02] transition"
            >
              {loading ? "Analyzing with AI..." : "Upload & Analyze"}
            </button>
          </div>

          {/* Result Card */}
          <div className="border border-zinc-700 rounded-3xl p-8 bg-zinc-950 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">
              AI Analysis Dashboard
            </h2>

            {!result && (
              <p className="text-gray-500">
                Upload a file to view fingerprint analysis,
                TruthScore, and Gemini explanation.
              </p>
            )}

            {result && (
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p
                    className={`text-lg font-semibold ${
                      result.status === "duplicate"
                        ? "text-red-400"
                        : result.status === "near-duplicate"
                        ? "text-yellow-300"
                        : "text-green-400"
                    }`}
                  >
                    {result.status || "unknown"}
                  </p>
                </div>

                {/* TruthScore */}
                <div>
                  <p className="text-sm text-gray-400">TruthScore</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {result.truthScore || 0}/100
                  </p>
                </div>

                {/* Risk Level */}
                <div>
                  <p className="text-sm text-gray-400">Risk Level</p>
                  <p className="font-medium">
                    {getRiskLevel(result.truthScore || 0)}
                  </p>
                </div>

                {/* System Message */}
                <div>
                  <p className="text-sm text-gray-400">System Message</p>
                  <p>{result.message}</p>
                </div>

                {/* Fingerprint */}
                {result.fingerprint && (
                  <div>
                    <p className="text-sm text-gray-400">
                      Digital Fingerprint
                    </p>
                    <p className="text-xs break-all text-gray-300">
                      {result.fingerprint}
                    </p>
                  </div>
                )}

                {/* Gemini Explanation */}
                {result.explanation && (
                  <div>
                    <p className="text-sm text-gray-400">
                      Gemini AI Explanation
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                )}

                {/* Ownership Certificate */}
                {result.certificatePath && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">
                      Ownership Certificate
                    </p>

                    <a
                      href={`https://truthtrace-xgrj.onrender.com${result.certificatePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-white text-black px-5 py-3 rounded-2xl font-semibold"
                    >
                      Download Certificate PDF
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detection History */}
        <div className="mt-14 border border-zinc-700 rounded-3xl p-8 bg-zinc-950 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">
            Recent Detection History
          </h2>

          <p className="text-gray-400 mb-6">
            Monitor previous media verification results and suspicious
            activity.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-zinc-800 p-5">
              <p className="text-sm text-gray-400">Match Clip 01</p>
              <p className="font-semibold text-red-400">
                Duplicate Detected
              </p>
              <p className="text-sm text-gray-500">
                TruthScore: 30/100
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 p-5">
              <p className="text-sm text-gray-400">Promo Banner</p>
              <p className="font-semibold text-green-400">
                Verified Unique
              </p>
              <p className="text-sm text-gray-500">
                TruthScore: 95/100
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 p-5">
              <p className="text-sm text-gray-400">
                Player Highlight
              </p>
              <p className="font-semibold text-yellow-300">
                Under Review
              </p>
              <p className="text-sm text-gray-500">
                TruthScore: 62/100
              </p>
            </div>
          </div>
        </div>

        {/* Admin Insight Section */}
        <div className="mt-10 border border-zinc-700 rounded-3xl p-8 bg-zinc-950 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">
            Admin AI Insights
          </h2>

          <p className="text-gray-300 leading-relaxed">
            Gemini AI continuously reviews suspicious uploads,
            identifies repeated misuse patterns, and helps
            organizations protect valuable sports media assets
            before violations spread across platforms.
          </p>
        </div>
      </section>
    </main>
  );
}