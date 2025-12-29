// =======================================
// ExpenseTypeController.cs
// Tile   : Core
// Module : TypeMaster > ExpenseType
// Layer  : CMMS_WEB (UI only)
// Version: 1.0.0
// =======================================

using System.Web.Mvc;
using CMMS_DAL.Modules.Core.TypeMaster.ExpenseType.Models;

namespace CMMS_WEB.Controllers.Core.TypeMaster
{
    public class ExpenseTypeController : Controller
    {
        /// <summary>
        /// Create/Edit page (SS #1 + SS #3)
        /// UI-only stage: data is loaded/saved via JS localStorage store.
        /// </summary>
        [HttpGet]
        public ActionResult ExpenseTypeIndex(string id = null)
        {
            ViewBag.Title = "Expenses Types"; // allowed (Title only)

            // UI-only: We do not load from DB here.
            // JS will read ?id=... and load from localStorage.
            var model = new ExpenseTypeViewModel();

            return View("~/Views/Core/TypeMaster/ExpenseType/ExpenseTypeIndex.cshtml", model);
        }

        /// <summary>
        /// List page (SS #2)
        /// UI-only stage: table data comes from JS localStorage store.
        /// </summary>
        [HttpGet]
        public ActionResult ExpenseTypeList()
        {
            ViewBag.Title = "Expense Type List"; // allowed (Title only)
            return View("~/Views/Core/TypeMaster/ExpenseType/ExpenseTypeList.cshtml");
        }
    }
}
