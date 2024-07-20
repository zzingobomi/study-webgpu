export function applyVector2(
  fi: number,
  sourceData: number[][],
  destData: number[]
) {
  if (sourceData[fi] && sourceData[fi].length > 0) {
    destData.push(sourceData[fi][0]);
    destData.push(sourceData[fi][1]);
  } else {
    destData.push(0);
    destData.push(0);
  }
}

export function applyVector3(
  fi: number,
  sourceData: number[][],
  destData: number[]
) {
  destData.push(sourceData[fi][0]);
  destData.push(sourceData[fi][1]);
  destData.push(sourceData[fi][2]);
}
