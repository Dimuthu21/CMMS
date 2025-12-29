$(document).ready(function () {
    const customersUrl = $("#getCustomersUrl").val();
    const saveUrl = $("#saveUrl").val();
    let items = [];

    $.getJSON(customersUrl, function (data) {
        data.forEach(c => {
            $("#CustomerId").append(
                `<option value="${c.UserId}" data-address="${c.Address}" data-tel="${c.Tel}">
                    ${c.DisplayName}
                </option>`
            );
        });
    });

    $("#CustomerId").change(function () {
        const selected = $(this).find(":selected");
        $("#Address").val(selected.data("address") || "");
        $("#Tel").val(selected.data("tel") || "");
    });

    // Handle inline product addition
    $("#addRow").click(function () {
        const productName = $("#productName").val();
        const qty = parseFloat($("#quantity").val());
        const price = parseFloat($("#unitPrice").val());

        if (!productName || !qty || !price) {
            Swal.fire("Error", "Please fill all product fields", "error");
            return;
        }

        const total = qty * price;
        
        // Add to items array
        items.push({ 
            ProductName: productName, 
            Quantity: parseInt(qty), 
            UnitPrice: parseFloat(price), 
            Total: parseFloat(total) 
        });

        // Add row to table
        $("#salesGrid tbody").append(`
            <tr>
                <td>${productName}</td>
                <td>${qty}</td>
                <td>${price.toFixed(2)}</td>
                <td>${total.toFixed(2)}</td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm del">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `);

        // Clear inputs
        $("#productName").val("");
        $("#quantity").val("");
        $("#unitPrice").val("");
        $("#productName").focus();

        // Update total
        updateTotal();
    });

    // Handle enter key on product inputs
    $("#productName, #quantity, #unitPrice").keypress(function(e) {
        if (e.which == 13) {
            e.preventDefault();
            $("#addRow").click();
        }
    });

    // Delete row handler
    $(document).on("click", ".del", function () {
        const index = $(this).closest("tr").index();
        items.splice(index, 1);
        $(this).closest("tr").remove();
        updateTotal();
    });

    // Calculate total amount
    function updateTotal() {
        const sum = items.reduce((a, b) => a + b.Total, 0);
        $("#totalAmount").text(sum.toFixed(2));
    }

    // Form submission
    $("#invoiceForm").submit(function (e) {
        e.preventDefault();

        const sale = {
            CustomerId: $("#CustomerId").val(),
            SalesTypeId: $("#SalesTypeId").val(),
            SalesLines: items
        };

        if (!sale.CustomerId || !sale.SalesTypeId || items.length === 0) {
            Swal.fire("Error", "Please fill all required fields and add at least one product.", "error");
            return;
        }

        $.ajax({
            url: saveUrl,
            type: "POST",
            data: JSON.stringify(sale),
            contentType: "application/json",
            success: function (res) {
                if (res.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Invoice Saved!",
                        text: res.message,
                        confirmButtonText: "View Report"
                    }).then(() => {
                        window.location.href = `/Sales/Report?invoiceId=${res.salesId}`;
                    });
                } else {
                    Swal.fire("Error", res.message, "error");
                }
            },
            error: function () {
                Swal.fire("Error", "Something went wrong.", "error");
            }
        });
    });
});
