import { publishScheduled } from "../src/features/stories/service";
function tick() {
  try {
    const n = publishScheduled();
    if (n)
      console.log(
        JSON.stringify({ event: "scheduler.tick", processed: n, time: new Date().toISOString() }),
      );
  } catch {
    console.error(JSON.stringify({ event: "scheduler.error", time: new Date().toISOString() }));
  }
}
tick();
setInterval(tick, 10000);
