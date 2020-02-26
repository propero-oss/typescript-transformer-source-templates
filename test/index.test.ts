import { HELLO } from "src/main";

describe("main.ts", () => {
  it("should export its members", () => {
    expect(HELLO).toEqual("Hello");
  });
});
