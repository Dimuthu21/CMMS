using System.Web.Mvc;
using CMMS_DAL.Modules.Core.Models;

namespace CMMS_WEB.Controllers.Core
{
    public class BloodGroupTypeController : Controller
    {
        // GET: Blood Group Type
        [HttpGet]
        public ActionResult Index()
        {
            ViewBag.Title = "Blood Group Type";

            // UI-only stage:
            // ViewModel is used ONLY for Razor helpers & validation messages.
            // Actual data loading/saving is handled in bloodgrouptype.js (localStorage).
            return View(
                "~/Views/Core/TypeMaster/BloodGroupType/BloodGroupTypeIndex.cshtml",
                new BloodGroupTypeViewModel()
            );
        }
    }
}
