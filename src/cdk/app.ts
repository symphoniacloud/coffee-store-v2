#!/usr/bin/env node
import 'source-map-support/register';
import {App, CfnOutput, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {FunctionUrlAuthType, Runtime} from "aws-cdk-lib/aws-lambda";
import {NodejsFunction, SourceMapMode} from "aws-cdk-lib/aws-lambda-nodejs";
import {createStackProps} from "./initSupport";

class CoffeeStoreStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const lambdaFunction = new NodejsFunction(this, 'HelloWorldFunction', {
            runtime: Runtime.NODEJS_16_X,
            entry: 'src/lambdaFunctions/api/lambda.ts',
            bundling: {
                target: 'node16',
                sourceMap: true,
                sourceMapMode: SourceMapMode.INLINE,
                sourcesContent: false,
                preCompilation: true
            },
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
new CoffeeStoreStack(app, 'CoffeeStore', createStackProps(app, 'default-coffee-store-stack'));