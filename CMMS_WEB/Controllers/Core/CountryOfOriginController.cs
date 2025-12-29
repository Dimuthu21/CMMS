using System.Web.Mvc;
using CMMS_DAL.Modules.Core.Models;

namespace CMMS_WEB.Controllers.Core
{
    public class CountryOfOriginController : Controller
    {
        [HttpGet]
        public ActionResult Index(string id)
        {
            ViewBag.Title = "Country Of Origin";
            return View("~/Views/Core/TypeMaster/CountryOfOrigin/CountryOfOriginIndex.cshtml",
                new CountryOfOriginViewModel());
        }
    }
}
