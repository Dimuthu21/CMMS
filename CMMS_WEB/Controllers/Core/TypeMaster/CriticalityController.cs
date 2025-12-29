

using System.Web.Mvc;
using CMMS_DAL.Modules.Core.TypeMaster.Criticality.Models;

namespace CMMS_WEB.Controllers.Core.TypeMaster
{
    public class CriticalityController : Controller
    {
      
        [HttpGet]
        public ActionResult CriticalityIndex(string id = null)
        {
            ViewBag.Title = "Criticality"; // allowed: Title only

            // UI-only: do not load from DB here.
            // HTML helpers need a model instance, so return an empty model.
            var model = new CriticalityViewModel();

            return View("~/Views/Core/TypeMaster/Criticality/CriticalityIndex.cshtml", model);
        }

        /// <summary>
        /// List page (SS #5)
        /// UI-only stage: table data comes from localStorage store via JS.
        /// </summary>
        [HttpGet]
        public ActionResult CriticalityList()
        {
            ViewBag.Title = "Criticality List"; // allowed: Title only
            return View("~/Views/Core/TypeMaster/Criticality/CriticalityList.cshtml");
        }
    }
}
