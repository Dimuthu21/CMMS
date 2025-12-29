using System.Web.Mvc;
using CMMS_DAL.Modules.Core.Models;

namespace CMMS_WEB.Controllers.Core
{
    public class BusinessPartnerController : Controller
    {
        [HttpGet]
        public ActionResult Create()
        {
            ViewBag.Title = "Business Partner";
            return View("~/Views/Core/BusinessPartner/BusinessPartner/BusinessPartnerCreate.cshtml",
                        new BusinessPartnerViewModel());
        }

        [HttpGet]
        public ActionResult List()
        {
            ViewBag.Title = "Business Partner List";
            return View("~/Views/Core/BusinessPartner/BusinessPartner/BusinessPartnerList.cshtml");
        }
    }
}
