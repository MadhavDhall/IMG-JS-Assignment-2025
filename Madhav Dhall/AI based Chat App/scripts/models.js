const models = [
    { id: "moonshotai/kimi-dev-72b:free", name: "Kimi Dev 72b" },
    { id: "deepseek/deepseek-r1-0528-qwen3-8b:free", name: "DeepSeek: Deepseek R1 0528 Qwen3 8B" },
    { id: "deepseek/deepseek-r1-0528:free", name: "DeepSeek: R1 0528" },
    { id: "sarvamai/sarvam-m:free", name: "Sarvam AI: Sarvam-M" },
    { id: "mistralai/devstral-small:free", name: "Mistral: Devstral Small" }
];

// document.addEventListener("DOMContentLoaded", () => {
document.getElementById("model-selector").innerHTML = models.map(model =>
    `<option value="${model.id}">${model.name}</option>`
)
// })