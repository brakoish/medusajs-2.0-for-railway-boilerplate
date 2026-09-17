jest.mock("@medusajs/framework/utils", () => ({ Modules: { NOTIFICATION: "notification" } }))
jest.mock("../constants", () => ({ BACKEND_URL: "https://admin.example.invalid" }))
jest.mock("../../modules/email-notifications/templates", () => ({ EmailTemplates: { PASSWORD_RESET: "password-reset" } }))

import passwordResetHandler from "../../subscribers/password-reset"

const createNotifications = jest.fn().mockResolvedValue({})
const container = { resolve: () => ({ createNotifications }) }

test.each([
  ["customer", "https://thedabpal.com/reset-password?token=a%2Bb%26c", true],
  ["user", "https://admin.example.invalid/app/reset-password?token=a%2Bb%26c", false],
])("%s password reset points to the correct application", async (actor_type, link, isCustomer) => {
  await passwordResetHandler({ event: { data: { actor_type, entity_id: "test@example.invalid", token: "a+b&c" } }, container } as any)
  expect(createNotifications).toHaveBeenCalledWith(expect.objectContaining({
    to: "test@example.invalid",
    data: expect.objectContaining({ resetLink: link, isCustomer }),
  }))
})

test("unsupported actors do not receive a reset link", async () => {
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
  await passwordResetHandler({ event: { data: { actor_type: "other", entity_id: "test@example.invalid", token: "token" } }, container } as any)
  expect(createNotifications).not.toHaveBeenCalled()
  warn.mockRestore()
})
