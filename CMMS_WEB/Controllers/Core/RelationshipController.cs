using System.Web.Mvc;
using CMMS_DAL.Modules.Core.Models;

namespace CMMS_WEB.Controllers.Core
{
    public class RelationshipController : Controller
    {
        [HttpGet]
        public ActionResult Index(string id)
        {
            ViewBag.Title = "Relationship";

            // UI-only: ViewModel just for HtmlHelpers
            // Data loads/saves using JS + localStorage
            return View("~/Views/Core/TypeMaster/Relationship/RelationshipIndex.cshtml",
                        new RelationshipViewModel());
        }
    }
}
