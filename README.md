# The Not-So-Complete (But Trying) LLM Engineer's Handbook 📘

[![Website](https://img.shields.io/badge/Website-aisystems.pages.dev-4ade80)](https://aisystems.pages.dev)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-llm--handbook-60a5fa)](https://harjotsinghh.github.io/llm-handbook/)
[![Educational Resource](https://img.shields.io/badge/Purpose-educational-a78bfa)](https://aisystems.pages.dev)

Welcome to **The Not-So-Complete (But Trying) LLM Engineer's Handbook**, a practitioner's guide covering the full Large Language Model engineering stack — from pretraining architecture to high-throughput deployment.

> **Disclaimer:** This project is purely for educational purposes. The data and content have been curated using deep research from AI platforms like Google Gemini and ChatGPT. It is designed to act as a structured learning path. Please verify the information independently before using it in production systems.

---

## Website

You can access the handbook here:

1. [https://aisystems.pages.dev](https://aisystems.pages.dev)
2. [https://harjotsinghh.github.io/llm-handbook/](https://harjotsinghh.github.io/llm-handbook/)

---

## 🗺️ Learning Roadmap

The handbook is structurally divided into five core stages of the LLM lifecycle:

1. **Foundations & Data**
   - Ch 1: Foundations of Modern LLMs (Tokenization, Architecture, Scaling Laws)
   - Ch 2: Data Engineering at Scale (Distributed Pipelines, Deduplication)
2. **Training & Fine-Tuning**
   - Ch 3: Continuous Pretraining (Domain Adaptation)
   - Ch 4: Supervised Fine-Tuning (SFT, Chat Templates)
   - Ch 5: Parameter-Efficient Fine-Tuning (LoRA, QLoRA, DoRA)
3. **Alignment & Evaluation**
   - Ch 6: Preference Alignment (RLHF, DPO, GRPO)
   - Ch 7: Evaluation & Benchmarking (MMLU, Pass@k, LLM-as-a-Judge)
4. **Applied Engineering**
   - Ch 8: Quantization & Training Pipelines
   - Ch 9: The Modern LLM Stack (LoRA ecosystem, Data Curation)
5. **Deployment & Inference**
   - Ch 10: Inference Serving & Memory (PagedAttention, Batching)
   - Ch 11: Diagnostics & Debugging (CUDA OOM runbooks)
   - Ch 12: LLM Inference Engineering (Roofline model, KV cache evolution)
   - Ch 13: Inference Optimization (FP8, Speculative Decoding)
   - Ch 14: Frontier Architectures (MLA, Hyperscale Training)

---

## 🛠️ Tech Stack & Shoutouts

This project was built to be fast, responsive, and aesthetic.
- **Frontend Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** Custom Vanilla CSS
- **Data Rendering:** JSON-driven components with custom Markdown/LaTeX parsing (`KaTeX`).
- **Research & Curation:** Huge shoutout to **Google Gemini** and **OpenAI's ChatGPT** for surfacing the dense research practically. 

---

## 📝 How to Update Content (For AI Agents)

The content of this handbook is structured entirely as JSON payloads so that it is easy to maintain and expand programmatically. 

We have set up two autonomous workflows specifically for editing this content using an AI agent (like Cursor, GitHub Copilot, or an autonomous assistant context):

1. **Creating a Brand New Chapter:**
   - Give your AI Agent access to the source material (e.g., a PDF textbook).
   - Ask it to run the **parse chapter** workflow by running: `/parse-chapter {N}`
   - The agent will read the prompt guide at `.agents/workflows/parse-chapter.md` and output the parsed data accurately formatting it as a JSON payload for the frontend.

2. **Updating or Adding Information to an Existing Chapter:**
   - If you read a new research paper or want to add a section (e.g., "Add information about QLoRA to Chapter 5"), run: `/update-chapter 5 with [URL/Text]`
   - The agent will read `.agents/workflows/update-chapter.md`, deduplicate the new info against what's already there, and carefully merge the required JSON blocks into existing structures.

---

## Contributing

This handbook is an educational resource curated with AI-assisted research and ongoing manual review. If you spot something outdated, unclear, broken, or missing, feel free to open an issue or submit a pull request.

Helpful contributions include:

- fixing inaccuracies or broken links
- improving explanations and readability
- adding missing references or sections
- polishing the UI, responsiveness, or accessibility

---

<div align="center">
  <p>Built with Vite &amp; React</p>
  <p>
    <a href="https://github.com/Harjotsinghh">GitHub</a> | 
    <a href="https://www.linkedin.com/in/harjotsi/">LinkedIn</a>
  </p>
</div>
