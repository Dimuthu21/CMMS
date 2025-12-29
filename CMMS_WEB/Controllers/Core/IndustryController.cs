using System.Web.Mvc;
using CMMS_DAL.Modules.Core.Models;

namespace CMMS_WEB.Controllers.Core
{
    public class IndustryController : Controller
    {
        [HttpGet]
        public ActionResult Index()
        {
            ViewBag.Title = "Industries";
            return View("~/Views/Core/BusinessPartner/Industries/IndustryIndex.cshtml", new IndustryViewModel());
        }
    }
}
