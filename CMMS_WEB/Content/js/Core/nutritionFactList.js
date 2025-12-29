const navigationMenuName = "NutritionFacts";
const currentCompanyId = $("#CurrentCompanyId").val();
const currentBranchId = $("#CurrentBranchId").val();

var tblDetails;
$(document).ready(function () {
    FilterNutritionFactList();

    tblDetails.on('click', '.details-control', function (e) {
        let tr = e.target.closest('tr');
        let row = tblDetails.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            $(tr).find("img[name='imgShowHide']").attr('src', $("#imgTableDetailOpen").val());
        }
        else {
            row.child(formatDetails(row.data())).show();
            $(tr).find("img[name='imgShowHide']").attr('src', $("#imgTableDetailClose").val());
        }
    });

    var dataTableClickEvent = 'dblclick';
    if (IsMobileDeviceBrowsing()) dataTableClickEvent = 'click';
    tblDetails.on(dataTableClickEvent, 'tr', function (e) {
        if (IsMobileDeviceBrowsing() && $(e.target).closest('td').hasClass('dtr-control')) {
            return;
        }
        var data = tblDetails.row(this).data();
        if (!data) return;
        OpenResourceUrl($("#ViewNutritionFactsUrl").val() + "/" + data.NutritionFactId, null, null);
    });
});

function ClearNutritionFactListFilter() {
    $("#Code").val('');
    $("#Name").val('');
    $("#StatusId").val('').trigger('change');
    FilterNutritionFactList();
}

function ValidateNutritionFactListFilter() {
    var result = true;
    // list filter validations if exists any
    return result;
}

function FilterNutritionFactList() {
    if (ValidateNutritionFactListFilter()) {
        var currentFilter = {
            "Code": $("#Code").val(),
            "Name": $("#Name").val(),
            "StatusId": $("#StatusId").val(),
            "CompanyId": currentCompanyId,
            "BranchId": currentBranchId
        };

        tblDetails = $("#tblDetails").DataTable({
            "serverSide": true,
            "processing": false,
            deferRender: true,
            "bPaginate": true,
            "bLengthChange": true,
            "bFilter": false,
            "bInfo": true,
            "bAutoWidth": false,
            "ordering": false,
            "bSortClasses": true,
            "bDestroy": true,
            "iDisplayLength": 10,
            responsive: false,
            scrollX: true,
            scrollCollapse: true,
            "columnDefs": [
                { targets: '_all', className: 'dt-left' },
                { targets: [8], visible: false }
            ],
            "ajax": {
                url: $("#BrowseNutritionFactListUrl").val(),
                type: "POST",
                dataType: "json",
                data: function (d) {
                    return $.extend({}, d, currentFilter);
                }
            },
            "columns": [
                { data: "Code" },
                { data: "Name" },
                { data: "Description" },
                { data: "StatusName" },
                { data: "CreatedBy" },
                { data: "CreatedDateStr" },
                { data: "UpdatedBy" },
                { data: "UpdatedDateStr" },
                { data: "NutritionFactId", visible: false }
            ]
        });
    }
}
