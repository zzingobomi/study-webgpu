import { QdrantManager } from "./QdrantManager";

const qdrantManager = new QdrantManager();
qdrantManager.createCollection("hori");

self.onmessage = async (event: MessageEvent) => {
  const { playerPosition, sight } = event.data;

  try {
    const qdrantData = await qdrantManager.getQdrantData(playerPosition, sight);
    self.postMessage({ qdrantData });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
