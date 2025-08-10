FROM denoland/deno:latest as base

WORKDIR /src

COPY . ./

RUN deno cache src/index.ts

CMD [ "run", "--allow-env", "--allow-net=0.0.0.0:9080", "src/index.ts" ]