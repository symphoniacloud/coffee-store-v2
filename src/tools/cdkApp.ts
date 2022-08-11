#!/usr/bin/env node
import 'source-map-support/register';
import {App, CfnOutput, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Code, Function, FunctionUrlAuthType, Runtime} from "aws-cdk-lib/aws-lambda";

class CoffeeStoreStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const lambdaFunction = new Function(this, 'HelloWorldFunction', {
            handler: 'lambda.handler',
            code: Code.fromAsset('dist/api.zip'),
            runtime: Runtime.NODEJS_16_X
        })

        const fnUrl = lambdaFunction.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE
        })

        new CfnOutput(this, 'ApiUrl', {
            value: fnUrl.url
        })
    }
}

const app = new App();

new CoffeeStoreStack(app, 'CoffeeStore', {
    env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
    stackName: app.node.tryGetContext('stackName') || 'default-coffee-store-stack'
});