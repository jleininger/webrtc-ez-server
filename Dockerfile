FROM denoland/deno:latest as base

WORKDIR /src

COPY . ./

RUN deno cache src/index.ts

CMD [ "run", "--allow-env", "--allow-net", "src/index.ts" ]