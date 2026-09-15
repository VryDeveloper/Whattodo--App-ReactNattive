import { validateTitle } from "../src/utils/validation";

describe("validateTitle", () => {
  it("rejeita título vazio", () => {
    expect(validateTitle("")).toBe("O título é obrigatório.");
    expect(validateTitle("   ")).toBe("O título é obrigatório.");
  });

  it("rejeita título com menos de 3 caracteres", () => {
    expect(validateTitle("ab")).toMatch(/mínimo/);
  });

  it("rejeita título com mais de 100 caracteres", () => {
    const longTitle = "a".repeat(101);
    expect(validateTitle(longTitle)).toMatch(/máximo/);
  });

  it("aceita título válido", () => {
    expect(validateTitle("Comprar leite")).toBeNull();
  });

  it("aceita título no limite de 100 caracteres", () => {
    expect(validateTitle("a".repeat(100))).toBeNull();
  });
});
