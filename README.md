# Coffee Store V2

This is a "walking skeleton" AWS Lambda app, using **TypeScript**, **CDK**, **Jest**, and **Github Actions**. It is
fully
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

## Getting started

* Clone this repo to your local machine
* If you want to use the included Github Actions workflow then create a new Github repo and push your local version of
  this repo to it.

## Working Locally from the Command Line

**Pre-requisites**: Node >= 16 installed

```
$ npm install
$ npm run type-check-and-unit-test
```

The unit tests run entirely locally, and execute the code directly, i.e. they do not use local runtime simulators. For
the reasoning behind this choice see https://blog.symphonia.io/posts/2020-08-19_serverless_testing .

## Working Locally from an IDE

* Install dependencies with `npm install`, or your IDE's Node support.
* Run unit tests using the configuration at [\_\_tests__/jest-unit.config.js](__tests__/jest-unit.config.js)

## Deploying to AWS

**Further pre-requisites**:

* Your local AWS environment should be setup to use the correct profile and region
    * If in doubt, run `aws s3 ls` to make sure you are seeing expected buckets
* You need to have bootstrapped your AWS account, in your desired region, for CDK - see appendix below.

Note - you **do not** need to install CDK locally since the deploy script below uses the CDK library and tooling defined
within the project.

Run `./deploy.sh`. 

If you want you can pass the name of the stack you want to
create as the first argument to the deploy script, alternatively the stack will be named `coffee-store-v2-$USERNAME`
where `$USERNAME` is your local username.

If deployment is successful you should see something like the following at the end of the process:

```shell
✨  Deployment time: 79.62s

Outputs:
CoffeeStore.ApiUrl = https://1234567890abcdefghij1234567890ab.lambda-url.us-east-1.on.aws/
Stack ARN:
arn:aws:cloudformation:us-east-1:1234567890:stack/coffee-store-v2-mike/12345678-1234-1234-1234-1234567890

✨  Total time: 82.11s
```

That `CoffeeStore.ApiUrl` is a public URL - access it with your browser and you should see a "Hello World" message.

Since this application is available to the public internet you probably want to tear it down when you're done with it.
To do so visit the CloudFormation section of the AWS Web Console and delete the stack.

## Running integration tests

This project includes an integration test which calls the deployed app in AWS via https and validates the response.

### Running integration tests targeting a stack that has already been deployed

If you want to run the tests against a stack that has already been deployed you should specify the stack's name with
the `STACK_NAME` environment variable, e.g.:

```shell
% STACK_NAME=coffee-store-v2-mike npm run integration-test
```

Alternatively, to run all tests (including unit tests), using a pre-deployed stack for the integration test, run:

```shell
% STACK_NAME=coffee-store-v2-mike npm test
```

If you are running tests via the IDE:

* Use the jest configuration at at [\_\_tests__/jest-integration.config.js](__tests__/jest-integration.config.js)
* make sure to specify the `STACK_NAME` env var as part of your test runner configuration if you want to use a
  pre-deployed stack.

### Running integration tests targeting an ephemeral stack

Alternatively the integration test can run against an _ephemeral_ stack - i.e. a new stack will be deployed as part of
test setup, and then torn down as part of test cleanup. To use this method don't
specify a `STACK_NAME` value in the environment.

E.g. if you run `npm run test` **with no** `STACK_NAME` you will see something like the following in the console output
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

### Prerequisites

The included Github Actions workflow at [.github/workflows/buildAndTest.yml](.github/workflows/buildAndTest.yml) will
build the app and run all tests. Since these tests include the integration tests, the workflow will (indirectly) deploy
an ephemeral version of the application to AWS, and therefore the Github Actions workflow needs permission to access
your AWS account.

For instructions on how to setup these permissions,
see [github-actions-prereqs/README.md](github-actions-prereqs/README.md).

### Usage

The included workflow will either run automatically whenever you push a change to the `main` branch, or when you run
the workflow manually through the web console.

You might choose to update the workflow to also deploy a non-ephemeral version of the app, in which case call
the `deploy.sh` script from the workflow after running `build.sh` - in which case you may also want to override
the `STACK_NAME` env var.

## Appendix

### Bootstrapping CDK

:warning: **If you are using a shared development account then make sure any changes you make here are compatible with
the rest of the account.**

This project uses **CDK version 2** to deploy the application to AWS. If your AWS account has **not already been
bootstrapped for CDK version 2** then read
the [official AWS instructions](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) to do so - without this
deployment will fail.

If you want to use the
version of CDK within the project then you should run `npx cdk ...` where the docs just say to run `cdk ...` . E.g. in
the simplest case to bootstrap an account with no specific options then just run `npx cdk bootstrap` from your terminal,
in the project's root directory.

## Changelog

### 2022.2

* Update Node to Node 16 (tooling + runtime)
* Switch to CDK for building, by using NodejsFunction
* Standardize project setup vs https://github.com/symphoniacloud/cdk-bare-bones

### 2022.1

* Uses TypeScript instead of Javascript, plus some opinionated build + package scripting
* Uses CDK instead of SAM
* Uses Github Actions instead of AWS CodeBuild for automation. Github Actions-to-AWS security uses OIDC, not long-lived
  access tokens.
* Uses a Lambda Function URL instead of API Gateway