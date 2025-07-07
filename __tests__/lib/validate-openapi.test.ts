import { validateOpenAPI } from "@/lib/openapi-conversion"

const baseSchema = {
  openapi: "3.1.0",
  info: {
    title: "API",
    description: "simple",
    version: "1.0.0"
  },
  servers: [{ url: "https://example.com" }],
  paths: {
    "/ping": {
      get: {
        operationId: "getPing"
      }
    }
  }
}

describe("validateOpenAPI", () => {
  it("accepts a valid schema", async () => {
    await expect(validateOpenAPI(JSON.parse(JSON.stringify(baseSchema)))).resolves.not.toThrow()
  })

  it("fails without info", async () => {
    const schema: any = JSON.parse(JSON.stringify(baseSchema))
    delete schema.info
    await expect(validateOpenAPI(schema)).rejects.toThrow("('info'): field required")
  })

  it("fails when path does not start with slash", async () => {
    const schema: any = JSON.parse(JSON.stringify(baseSchema))
    schema.paths = { ping: { get: { operationId: 'getPing' } } }
    await expect(validateOpenAPI(schema)).rejects.toThrow('Path ping does not start with a slash; skipping')
  })

  it("fails when operationId missing", async () => {
    const schema: any = JSON.parse(JSON.stringify(baseSchema))
    schema.paths['/ping'].get = {}
    await expect(validateOpenAPI(schema)).rejects.toThrow('Some methods are missing operationId')
  })

  it("fails when requestBody lacks content", async () => {
    const schema: any = JSON.parse(JSON.stringify(baseSchema))
    schema.paths['/ping'].post = { operationId: 'createPing', requestBody: {} }
    await expect(validateOpenAPI(schema)).rejects.toThrow('Some methods with a requestBody are missing requestBody.content')
  })
})
