import cluster from "node:cluster";
import os from "node:os";

if (cluster.isPrimary) {
  const numWorkers =
    Number(process.env.CLUSTER_WORKERS) || os.availableParallelism();
  console.info(`Primary ${process.pid} starting ${numWorkers} workers`);

  for (let i = 0; i < numWorkers; i += 1) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code) => {
    console.warn(
      `Worker ${worker.process.pid} died (code: ${code}), restarting...`
    );
    cluster.fork();
  });
} else {
  import("./index");
}
