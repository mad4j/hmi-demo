export const applyTransactionGoOnApply = (page, { goHome, goToPreviousPage }) => {
  if (!page) return

  if (page.goOnApply === 'GO_HOME') {
    goHome()
    return
  }

  if (page.goOnApply === 'GO_BACK') {
    goToPreviousPage()
  }
}
