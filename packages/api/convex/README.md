# Convex functions (`packages/api/convex`)

This directory is the Convex function bundle for rlist. Queries, mutations, actions, and HTTP routes live here alongside `schema.ts` and auth configuration.

- See **[../README.md](../README.md)** for how to run `convex dev`, deploy, and how clients connect.
- See the [Convex function docs](https://docs.convex.dev/functions) for `query` / `mutation` patterns and `v` validators.

After `convex dev` or `convex codegen`, types are emitted under `convex/_generated/` for use from React and from `@rlist/api` in workspace apps.
