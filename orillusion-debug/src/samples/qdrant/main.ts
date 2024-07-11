import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({ host: "localhost", port: 6333 });

const createCollection = async () => {
  await client.createCollection("test_collection", {
    vectors: { size: 3, distance: "Euclid" },
  });
};

const upsertVectors = async () => {
  const operationInfo = await client.upsert("test_collection", {
    wait: true,
    points: [
      { id: 1, vector: [0.0, 0.0, 0.0] },
      { id: 2, vector: [1.0, 0.0, 0.0] },
      { id: 3, vector: [2.0, 0.0, 0.0] },
      { id: 4, vector: [3.0, 0.0, 0.0] },
      { id: 5, vector: [4.0, 0.0, 0.0] },
      { id: 6, vector: [5.0, 0.0, 0.0] },
    ],
  });

  console.log(operationInfo);
};

const runQuery = async () => {
  const searchVector = [2.5, 0, 0];
  const distanceThreshold = 2;

  let searchResult = await client.search("test_collection", {
    vector: searchVector,
    score_threshold: distanceThreshold,
  });

  console.log(searchResult);
};

//createCollection();
//upsertVectors();
runQuery();
