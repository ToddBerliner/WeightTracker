import WeightTracker from "./weighttracker";
// Testing
/*
- call input w/ values
-- assert initial results
-- call input w/ values again
-- assert correct results
-- call w/ dow=0
-- assert new week
*/
test("WeightTracker is a class", () => {
  expect(typeof WeightTracker.prototype.constructor).toEqual("function");
});
describe("Update State", () => {
  test("It adds new days", () => {
    const wt = new WeightTracker();
    const dateKey = "123";
    const expectedState = {
      days: { "123": { weight: 123.4, body_fat: 56.7 } },
    };
    wt.updateState("123", 123.4, 56.7);
    expect(wt.state).toEqual(expectedState);

    wt.updateState("456", 123.4, 56.7);
    expect(Object.keys(wt.state.days).length).toBe(2);
  });
});
