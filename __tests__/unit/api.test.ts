import {test} from '@jest/globals'
import {handler} from "../../src/lambdaFunctions/api/lambda";

test('lambda function should return expected message', async () => {
    // We're not passing a (type) valid event here, but we know our handler doesn't use the event
    // @ts-ignore
    const result = await handler({}, null, null);

    const expectedResult = {
        statusCode: 200,
        body: "Hello World V2!"
    };

    expect(result).toEqual(expectedResult);
})

