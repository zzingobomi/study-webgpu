import { QdrantManager } from "./QdrantManager";

const qdrantManager = new QdrantManager();
qdrantManager.createCollection("hori");

// 애초에 update 하고 주기가 다른데... debounce 개념이 있어야 하나?
self.onmessage = async (event: MessageEvent) => {
  const { playerPosition, sight } = event.data;

  try {
    const qdrantData = await qdrantManager.getQdrantData(playerPosition, sight);

    // 여기서 뭔가 가공을 해서 줘야하나....

    self.postMessage({ qdrantData });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
