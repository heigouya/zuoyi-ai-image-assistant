"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type JobStatus = "idle" | "creating" | "running" | "completed" | "failed";

type JobResult = {
  id: string;
  status: JobStatus;
  message: string;
  codexPrompt: string;
  workspaceJobPath: string;
  images: string[];
};

type ModuleConfig = {
  id: string;
  title: string;
  skillName: string;
  skillId?: string;
  status: string;
  description: string;
  outputs: string[];
};

const cn = {
  appName: "\u4f50\u6613-AI\u56fe\u50cf\u52a9\u7406",
  appIntro:
    "\u6a21\u5757\u5316 AI \u51fa\u56fe\u5de5\u4f5c\u53f0\u3002\u5148\u8dd1\u901a\u4e9a\u9a6c\u900a\u5957\u56fe\u751f\u6210\uff0c\u540e\u7eed\u53ef\u7ee7\u7eed\u4e0a\u4f20\u5176\u4ed6\u6a21\u677f\u3002",
  currentModule: "\u5f53\u524d\u6a21\u5757",
  boundTemplate: "\u7ed1\u5b9a\u6280\u80fd",
  localLoop: "\u672c\u5730\u95ed\u73af",
  result: "\u7ed3\u679c",
  submit: "\u63d0\u4ea4\u5230 Codex \u8dd1\u5957\u56fe",
  creating: "\u6b63\u5728\u521b\u5efa Codex \u4efb\u52a1...",
  imageUpload: "\u4ea7\u54c1\u5b9e\u62cd\u56fe",
  imageUploadHint:
    "\u4e0a\u4f20\u4ea7\u54c1\u56fe\uff0c\u7528\u4f5c Codex / Image Gen \u7684\u771f\u5b9e\u7ed3\u6784\u53c2\u8003",
  previewAlt: "\u4e0a\u4f20\u4ea7\u54c1\u56fe\u9884\u89c8",
  productName: "\u4ea7\u54c1\u540d\u79f0",
  marketplace: "\u76ee\u6807\u7ad9\u70b9",
  sourceLink: "\u91c7\u8d2d\u94fe\u63a5",
  outputMode: "\u8f93\u51fa\u8981\u6c42",
  competitor: "\u7ade\u54c1\u94fe\u63a5/\u622a\u56fe\u8bf4\u660e",
  specs: "\u89c4\u683c",
  accessories: "\u914d\u4ef6\u6e05\u5355",
  sellingPoints: "\u6838\u5fc3\u5356\u70b9",
  placeholder: "\u53ef\u7a7a",
  slotTitle: "\u6a21\u5757\u63d2\u69fd\u5df2\u9884\u7559",
  slotBody:
    "\u540e\u7eed\u4e0a\u4f20\u8fd9\u4e2a\u6a21\u5757\u5bf9\u5e94\u7684\u6a21\u677f\u914d\u7f6e\u540e\uff0c\u5b83\u4f1a\u590d\u7528\u540c\u4e00\u5957 bridge\uff1a\u9009\u62e9\u6a21\u5757\u3001\u4e0a\u4f20\u53c2\u6570\u3001\u521b\u5efa job\u3001\u8c03\u7528 Codex\u3001\u8fd4\u56de\u56fe\u7247\u3002",
  codexPrompt: "Codex \u63d0\u793a\u8bcd",
  noResult:
    "\u63d0\u4ea4\u7b2c\u4e00\u4e2a\u4e9a\u9a6c\u900a\u5957\u56fe\u4efb\u52a1\u540e\uff0c\u8fd9\u91cc\u4f1a\u663e\u793a Codex job \u4fe1\u606f\u3001\u5019\u9009\u56fe\u548c\u63d0\u793a\u8bcd\u3002",
};

const bridgeUrl = "http://127.0.0.1:48721";
const amazonSkillId = "amazon-image-a-plus-planner";

const modules: ModuleConfig[] = [
  {
    id: "amazon-a-plus-suite",
    title: "\u4e9a\u9a6c\u900a\u5957\u56fe\u751f\u6210",
    skillName: "$amazon-image-a-plus-planner",
    skillId: amazonSkillId,
    status: "\u5df2\u63a5\u5165",
    description:
      "\u4e0a\u4f20\u4ea7\u54c1\u56fe\u548c\u5546\u54c1\u53c2\u6570\uff0c\u521b\u5efa Codex \u4efb\u52a1\uff0c\u8f93\u51fa\u4e3b\u56fe\u3001\u5356\u70b9\u56fe\u548c A+ \u6a21\u5757\u5019\u9009\u56fe\u3002",
    outputs: [
      "7 \u5f20\u4e3b\u56fe",
      "A+ \u684c\u9762\u6a21\u5757",
      "A+ \u624b\u673a\u6a21\u5757",
      "Image Gen \u5019\u9009\u56fe",
    ],
  },
  {
    id: "scene-generation",
    title: "\u573a\u666f\u751f\u6210",
    skillName: "\u5f85\u4e0a\u4f20\u6a21\u677f",
    status: "\u9884\u7559",
    description:
      "\u4e0a\u4f20\u4ea7\u54c1\u56fe\uff0c\u9700\u8981\u7684\u56fe\u7247\u5c3a\u5bf8\uff0c\u751f\u6210\u9002\u914d\u7684\u4ea7\u54c1\u573a\u666f",
    outputs: [
      "\u4ea7\u54c1\u573a\u666f",
      "\u5c3a\u5bf8\u9002\u914d",
      "\u80cc\u666f\u751f\u6210",
    ],
  },
  {
    id: "white-bg-render",
    title: "\u7cbe\u4fee/\u6e32\u67d3\u56fe",
    skillName: "\u5f85\u4e0a\u4f20\u6a21\u677f",
    status: "\u9884\u7559",
    description:
      "\u628a\u5b9e\u62cd\u56fe\u5904\u7406\u6210\u9ad8\u8d28\u611f\u767d\u5e95\u7535\u5546\u7cbe\u4fee\u56fe\u62163D\u6e32\u67d3\u56fe\uff0c\u4fdd\u7559\u8f6e\u5ed3\u548c\u6750\u8d28\u3002",
    outputs: ["\u767d\u5e95\u56fe", "\u6750\u8d28\u589e\u5f3a", "\u9634\u5f71\u6821\u6b63"],
  },
  {
    id: "image-extension",
    title: "\u667a\u80fd\u6269\u56fe",
    skillName: "\u5f85\u4e0a\u4f20\u6a21\u677f",
    status: "\u9884\u7559",
    description:
      "\u4e00\u952e\u65e0\u7f1d\u6269\u5c55\uff0c\u6253\u7834\u89c6\u89c9\u8fb9\u754c\uff0c\u91ca\u653e\u6bcf\u4e00\u5f20\u7167\u7247\u7684\u65e0\u9650\u53ef\u80fd~",
    outputs: ["1:1", "16:9", "4:5", "A+ \u6a2a\u56fe"],
  },
  {
    id: "image-upscale",
    title: "\u9ad8\u6e05\u653e\u5927",
    skillName: "\u5f85\u4e0a\u4f20\u6a21\u677f",
    status: "\u9884\u7559",
    description:
      "\u653e\u5927\u6e05\u6670\u4e0d\u5931\u771f\uff0c\u7ec6\u8282\u66f4\u4e30\u5bcc",
    outputs: ["2x", "4x", "\u7ec6\u8282\u589e\u5f3a"],
  },
];

const defaultForm = {
  productName: "\u70df\u56f1\u5237\u6746\u5957\u88c5",
  marketplace: "Amazon Germany",
  sourceLink: "",
  competitorLinks: "",
  specs: "\u73bb\u7483\u7ea4\u7ef4\u5237\u6746\uff0c\u9002\u914d\u70df\u56f1\u6e05\u6d01\u5237\u5934\uff0c\u53ef\u62fc\u63a5\u5ef6\u957f\u3002",
  accessories:
    "\u5237\u6746\u3001\u8fde\u63a5\u5934\u3001\u6536\u7eb3\u914d\u4ef6\uff0c\u6309\u5b9e\u62cd\u56fe\u4e3a\u51c6\u3002",
  sellingPoints:
    "\u8010\u7528\u3001\u6613\u5b89\u88c5\u3001\u9002\u5408\u5bb6\u5ead\u70df\u56f1\u6e05\u6d01\u3001\u53ef\u5ef6\u957f\u4f7f\u7528\u8ddd\u79bb\u3002",
  outputMode:
    "\u5148\u751f\u6210 7 \u5f20\u4e3b\u56fe\u548c A+ \u7b56\u5212\uff0c\u518d\u51fa 3 \u5f20\u5019\u9009\u56fe\u3002",
};

export default function Home() {
  const [activeModuleId, setActiveModuleId] = useState("amazon-a-plus-suite");
  const [form, setForm] = useState(defaultForm);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [referenceMode, setReferenceMode] = useState<"image" | "link">("image");
  const [referenceDataUrl, setReferenceDataUrl] = useState<string | null>(null);
  const [referenceName, setReferenceName] = useState("");
  const [status, setStatus] = useState<JobStatus>("idle");
  const [result, setResult] = useState<JobResult | null>(null);
  const [error, setError] = useState("");

  const activeModule = useMemo(
    () => modules.find((item) => item.id === activeModuleId) ?? modules[0],
    [activeModuleId],
  );

  const canSubmit =
    activeModule.id === "amazon-a-plus-suite" &&
    form.productName.trim().length > 0 &&
    form.sellingPoints.trim().length > 0;

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result));
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function onReferenceUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReferenceDataUrl(String(reader.result));
      setReferenceName(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function submitJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("creating");
    setResult(null);
    setError("");

    try {
      const response = await fetch(`${bridgeUrl}/jobs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          templateId: activeModule.id,
          templateName: activeModule.skillName,
          skillId: activeModule.skillId ?? "",
          ...form,
          productImage: imageDataUrl
            ? { name: imageName || "product-image.png", dataUrl: imageDataUrl }
            : null,
          referenceMode,
          referenceImage:
            referenceMode === "image" && referenceDataUrl
              ? {
                  name: referenceName || "reference-image.png",
                  dataUrl: referenceDataUrl,
                }
              : null,
          competitorLinks:
            referenceMode === "link" ? form.competitorLinks : "",
        }),
      });

      const data = (await response.json()) as JobResult;
      if (!response.ok) throw new Error(data.message || "Job failed");

      setResult(data);
      setStatus(data.status);
    } catch (caught) {
      setStatus("failed");
      setError(
        caught instanceof Error
          ? caught.message
          : "Cannot connect to bridge server. Start npm run bridge first.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#19211d]">
      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[#d6cec1] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-[#697164]">
              Demo Image Assistant
            </p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
              {cn.appName}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5a645b]">
              {cn.appIntro}
            </p>
          </div>
          <div className="rounded-md border border-[#c8beb0] bg-white px-4 py-3 text-sm">
            <span className="font-semibold">{cn.currentModule}:</span>{" "}
            {activeModule.title}
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_380px]">
          <aside className="space-y-3">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  setActiveModuleId(module.id);
                  setResult(null);
                  setError("");
                  setStatus("idle");
                }}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  activeModuleId === module.id
                    ? "border-[#1f3e36] bg-[#e4efe5]"
                    : "border-[#d6cec1] bg-white hover:border-[#9d9386]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base font-semibold">{module.title}</span>
                  <span className="rounded-md bg-[#f0ebe3] px-2 py-1 text-xs">
                    {module.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#5f685f]">
                  {module.description}
                </p>
              </button>
            ))}
          </aside>

          <section className="space-y-4">
            <div className="rounded-lg border border-[#d6cec1] bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{activeModule.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5a645b]">
                    {activeModule.description}
                  </p>
                  <p className="mt-2 text-sm text-[#6d746b]">
                    {cn.boundTemplate}: {activeModule.skillName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeModule.outputs.map((item) => (
                    <span
                      key={item}
                      className="rounded-md bg-[#f1ece4] px-3 py-1 text-xs font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {activeModule.id === "amazon-a-plus-suite" ? (
              <form
                onSubmit={submitJob}
                className="grid gap-4 rounded-lg border border-[#d6cec1] bg-white p-5 lg:grid-cols-[360px_minmax(0,1fr)]"
              >
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold">{cn.imageUpload}</span>
                    <div className="mt-2 flex min-h-72 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-[#aaa193] bg-[#f2eee7] text-center text-sm text-[#665f56]">
                      <label className="flex h-full w-full cursor-pointer items-center justify-center">
                        {imageDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageDataUrl}
                            alt={cn.previewAlt}
                            className="max-h-80 w-full object-contain"
                          />
                        ) : (
                          <span className="px-8">{cn.imageUploadHint}</span>
                        )}
                        <input
                          className="sr-only"
                          type="file"
                          accept="image/*"
                          onChange={onUpload}
                        />
                      </label>
                    </div>
                  </label>
                  <button
                    disabled={!canSubmit || status === "creating"}
                    className="h-12 w-full rounded-md bg-[#1d352f] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#9ba69f]"
                  >
                    {status === "creating" ? cn.creating : cn.submit}
                  </button>
                  {error && (
                    <p className="rounded-md bg-[#fff0ef] p-3 text-sm text-[#9b2e25]">
                      {error}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label={cn.productName}
                    value={form.productName}
                    onChange={(value) => updateField("productName", value)}
                  />
                  <Field
                    label={cn.marketplace}
                    value={form.marketplace}
                    onChange={(value) => updateField("marketplace", value)}
                  />
                  <Field
                    label={cn.sourceLink}
                    value={form.sourceLink}
                    onChange={(value) => updateField("sourceLink", value)}
                    placeholder={cn.placeholder}
                  />
                  <Field
                    label={cn.outputMode}
                    value={form.outputMode}
                    onChange={(value) => updateField("outputMode", value)}
                  />
                  <div>
                    <span className="text-sm font-semibold">参考图或产品链接</span>
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-md border border-[#cbc3b7] bg-[#f7f4ee] p-1">
                      <button
                        type="button"
                        onClick={() => setReferenceMode("image")}
                        className={`h-9 rounded text-sm font-semibold ${
                          referenceMode === "image"
                            ? "bg-[#1d352f] text-white"
                            : "text-[#5f685f]"
                        }`}
                      >
                        上传参考图
                      </button>
                      <button
                        type="button"
                        onClick={() => setReferenceMode("link")}
                        className={`h-9 rounded text-sm font-semibold ${
                          referenceMode === "link"
                            ? "bg-[#1d352f] text-white"
                            : "text-[#5f685f]"
                        }`}
                      >
                        参考链接
                      </button>
                    </div>
                    {referenceMode === "image" ? (
                      <label className="mt-2 flex min-h-24 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-[#aaa193] bg-[#f2eee7] text-center text-sm text-[#665f56]">
                        {referenceDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={referenceDataUrl}
                            alt="参考图预览"
                            className="max-h-28 w-full object-contain"
                          />
                        ) : (
                          <span>点击上传参考图</span>
                        )}
                        <input
                          className="sr-only"
                          type="file"
                          accept="image/*"
                          onChange={onReferenceUpload}
                        />
                      </label>
                    ) : (
                      <textarea
                        value={form.competitorLinks}
                        onChange={(event) =>
                          updateField("competitorLinks", event.target.value)
                        }
                        placeholder="粘贴产品链接或参考链接"
                        className="mt-2 min-h-24 w-full resize-none rounded-md border border-[#cbc3b7] p-3 text-sm leading-6"
                      />
                    )}
                  </div>
                  <TextField
                    label={cn.specs}
                    value={form.specs}
                    onChange={(value) => updateField("specs", value)}
                  />
                  <TextField
                    label={cn.accessories}
                    value={form.accessories}
                    onChange={(value) => updateField("accessories", value)}
                  />
                  <TextField
                    label={cn.sellingPoints}
                    value={form.sellingPoints}
                    onChange={(value) => updateField("sellingPoints", value)}
                  />
                </div>
              </form>
            ) : (
              <div className="rounded-lg border border-[#d6cec1] bg-white p-8 text-center">
                <h3 className="text-xl font-semibold">{cn.slotTitle}</h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#5f685f]">
                  {cn.slotBody}
                </p>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border border-[#d6cec1] bg-[#1f2b25] p-4 text-white">
              <h2 className="text-base font-semibold">{cn.localLoop}</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-[#dfe7df]">
                <p>1. npm run bridge</p>
                <p>2. npm run dev</p>
                <p>3. Job writes to sheji-codex/output/jobs.</p>
                <p>4. ENABLE_CODEX_EXEC=1 tries codex exec.</p>
              </div>
            </section>

            <section className="rounded-lg border border-[#d6cec1] bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{cn.result}</h2>
                <span className="rounded-md bg-[#edf3ec] px-2 py-1 text-xs font-semibold text-[#2e6b41]">
                  {result?.status ?? status}
                </span>
              </div>

              {result ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-md bg-[#f2eee7] p-3 text-sm leading-6">
                    <p>Job ID: {result.id}</p>
                    <p>Status: {result.message}</p>
                    <p>Path: {result.workspaceJobPath}</p>
                  </div>
                  <div className="grid gap-3">
                    {result.images.map((image) => (
                      <article
                        key={image}
                        className="overflow-hidden rounded-md border border-[#ded6ca] bg-[#fbfaf7]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image}
                          alt="generated candidate"
                          className="aspect-square w-full object-cover"
                        />
                      </article>
                    ))}
                  </div>
                  <details className="rounded-md border border-[#ded6ca] bg-[#fbfaf7] p-3">
                    <summary className="cursor-pointer text-sm font-semibold">
                      {cn.codexPrompt}
                    </summary>
                    <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-5">
                      {result.codexPrompt}
                    </pre>
                  </details>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[#5f685f]">
                  {cn.noResult}
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-md border border-[#cbc3b7] px-3 text-sm"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-24 w-full resize-none rounded-md border border-[#cbc3b7] p-3 text-sm leading-6"
      />
    </label>
  );
}
