import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (): Promise<APIGatewayProxyResultV2> => {
    console.log('API Lambda was called')

    return {
        statusCode: 200,
        body: "Hello World V2!",
    };
}