using System.Web.Mvc;
using CMMS_DAL.Modules.Core.Models;

namespace CMMS_WEB.Controllers.Core
{
    public class IssueMethodController : Controller
    {
        [HttpGet]
        public ActionResult Index(string id)
        {
            ViewBag.Title = "Issue Method";
            return View("~/Views/Core/TypeMaster/IssueMethod/IssueMethodIndex.cshtml", new IssueMethodViewModel());
        }
    }
}
