import { render } from "@testing-library/react";
import View from "./View";

describe(View, () => {
    // TODO - add tests
    it("displays initial settings", () => {
        const {getAllByTestId} = render(<View />);
        const value = getAllByTestId("dataType").textContent;
        expect(value).toBe("pods");
    });
})
