# Coffee Store V2

This is a "walking skeleton" AWS Lambda app, using **TypeScript**, **CDK**, **Jest**, and **Github Actions**. It is fully
deployable, includes tests, and has a Github Actions workflow that will perform integration tests on an ephemeral
deployment in AWS.

In other words you can use this repo as a basis for making your own TypeScript Lambda-based applications.

This is an updated version of a demo app I originally put together in 2020 for
[Cloud Coffee Break](https://github.com/symphoniacloud/cloud-coffee-break), a YouTube series I recorded.

This version contains the following changes since the 2020 version:

* Uses TypeScript instead of Javascript
* Uses CDK instead of SAM
* Uses Github Actions instead of AWS CodeBuild for automation. Github Actions-to-AWS security uses OIDC, not long-lived
  access tokens.
* Uses a Lambda Function URL instead of API Gateway

## Other CDK examples

This example is part of a collection of CDK examples - others are as follows:

* [CDK bare-bones app for TypeScript](https://github.com/symphoniacloud/cdk-bare-bones) - Base project for any TypeScript app using CDK for deployment to AWS. **Try this first if you are getting started with CDK.**
* [Coffee Store Web Basic](https://github.com/symphoniacloud/coffee-store-web-basic) - Website hosting on AWS with CloudFront and S3
* [Coffee Store Web Full](https://github.com/symphoniacloud/coffee-store-web-full) - A further extension of _Coffee Store Web Basic_ that is a real working demo of a production-ready website project, including TLS certificates, DNS hosting, Github Actions Workflows, multiple CDK environments (prod vs test vs dev)

## How this project works

This example deploys a CDK _App_ that deploys a Lambda Function, together with a [Lambda Function URL](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) to make it accessible over HTTP.

To build the Lambda function, this example uses the [`NodejsFunction` CDK Construct](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html) which performs build actions as part of the deploy process. In this configuration the Construct:

* Runs TSC in "noEmit" mode to perform type-checking
* Runs Esbuild to create an optimized artifact for the Lambda function 

### "CDK as build tool"

Using `NodejsFunction` makes CDK a build tool and not just a deployment tool. In the past I've been hesitant to use this feature since it didn't feel like it worked well for me.

As of August 2022, however, I feel like `NodejsFunction` is probably "good enough" for many small to medium size TS Lambda projects. There's still one small bug for `NodejsFunction` in how I have TSC configured (see the comment in [_tsconfig.json_](tsconfig.json)), but there's a reasonable workaround for that.

If you'd like more control over your build process then swap `NodejsFunction` for the standard CDK `Function` construct, and add a _build_ phase to your project. To see an example of this, including a wrapper script for ESBuild, see the [earlier version of this project](https://github.com/symphoniacloud/coffee-store-v2/tree/57a209a28be7eabe468125ea1d5dc0f81433fcd2).

## Prerequisites

Please see the [prerequisites of the cdk-bare-bones](https://github.com/symphoniacloud/cdk-bare-bones#prerequisites) project - all of the prerequisites in that project also apply to this one.

## Usage

After cloning this project to your local machine, run the following to perform local checks on the code:

```shell
$ npm install && npm run type-check-and-unit-test
```

If successful, the end result will look something like this:

```shell
Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.253 s
Ran all test suites.
```

The unit tests run entirely locally, and execute the code directly, i.e. they do not use local runtime simulators. For
the reasoning behind this choice see https://blog.symphonia.io/posts/2020-08-19_serverless_testing .

> Once you've run npm install once in the directory you won't need to again

To deploy the application to AWS run the following:

```shell
$ npm run deploy
```

If successful, the end result will look something like this:

```shell
 ✅  CoffeeStore (coffee-store-v2)

✨  Deployment time: 64.38s

Outputs:
CoffeeStore.ApiUrl = https://t7bz3kq6zhpqiotdgp3tpvv7ie0vkpcw.lambda-url.us-east-1.on.aws/
Stack ARN:
arn:aws:cloudformation:us-east-1:397589511426:stack/coffee-store-v2/7ef9afc0-1a72-11ed-91e9-0e87df064301

✨  Total time: 68.29s
```

That `CoffeeStore.ApiUrl` value is a public URL - access it with your browser and you should see a "Hello World" message.

For other commands, **including how to teardown**, see the [_Usage_ section of the bare-bones project README](https://github.com/symphoniacloud/cdk-bare-bones#usage).

## Working Locally from an IDE

* Install dependencies with `npm install`, or your IDE's Node support.
* Run unit tests using the configuration at [\_\_tests__/jest-unit.config.js](__tests__/jest-unit.config.js)

## Running integration tests

This project includes an integration test which calls the deployed app in AWS via https and validates the response.

### Running integration tests targeting a stack that has already been deployed

If you want to run the integration tests against a stack that has already been deployed you should specify the stack's name with
the `STACK_NAME` environment variable, e.g.:

```shell
$ STACK_NAME=coffee-store-v2 npm run integration-test
```

If you are running tests via the IDE:

* Use the jest configuration at at [\_\_tests__/jest-integration.config.js](__tests__/jest-integration.config.js)
* make sure to specify the `STACK_NAME` env var as part of your test runner configuration if you want to use a
  pre-deployed stack.

### Running integration tests targeting an ephemeral stack

Alternatively the integration test can run against an _ephemeral_ stack - i.e. a new stack will be deployed as part of
test setup, and then torn down as part of test cleanup. To use this method don't
specify a `STACK_NAME` value in the environment.

E.g. if you run `npm run integration-test` **with no** `STACK_NAME` you will see something like the following in the console output
while the integration test is being run:

```shell
  console.log
    Starting cloudformation deployment of stack coffee-store-it-20220425-160643

      at integration/api-integration.test.ts:15:17
```

and a little later you will see:

```shell
  console.log
    Calling cloudformation to delete stack coffee-store-it-20220425-160643
```

#### Modifying the ephemeral stack name used

The example above shows the test creating a stack named `stack coffee-store-it-20220425-160643`. If you want an
alternative to the start of the name being `coffee-store-it` you can specify
the `STACK_NAME_PREFIX` environment variable when running the integration test.

## Continuous integration automation

### Github Actions Prerequisites

The included Github Actions workflow at [.github/workflows/buildAndTest.yml](.github/workflows/buildAndTest.yml) will
run all tests. Since these tests include the integration tests, the workflow will (indirectly) deploy
an ephemeral version of the application to AWS, and therefore the Github Actions workflow needs permission to access
your AWS account.

For instructions on how to setup these permissions,
see [github-actions-prereqs/README.md](github-actions-prereqs/README.md).

### Usage

The included workflow will either run automatically whenever you push a change to the `main` branch, or when you run
the workflow manually through the web console.

You might choose to update the workflow to also deploy a non-ephemeral version of the app. To do this add running
`npm run deploy` to your workflow - in which case you may also want to specify the `STACK_NAME` env var.

## Changelog

### 2022.2

* Update Node to Node 16 (tooling + runtime)
* Switch to CDK for building, by using NodejsFunction
* Standardize project setup vs https://github.com/symphoniacloud/cdk-bare-bones
* Update this README, referring to bare bones project to avoid duplication
* Remove username based stack naming to simplify things a little

### 2022.1

* Uses TypeScript instead of Javascript, plus some opinionated build + package scripting
* Uses CDK instead of SAM
* Uses Github Actions instead of AWS CodeBuild for automation. Github Actions-to-AWS security uses OIDC, not long-lived
  access tokens.
* Uses a Lambda Function URL instead of API Gateway