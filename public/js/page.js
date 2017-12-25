var initDetailMask = function () {
    var wH = $(window).height();
    var infoH = $("#apiDetailInfo").height();
    var h = wH - infoH - 50;
    $("#apiDetailCode").height(h);
};
var filterArr = function () {

};
var showTr = function () {
    // arr = {
    //     "buy": ["delivery", "purchaseCarts"],
    //     "erp": ["banner"]
    // }
    var arr = new Object();
    if ($("#filterBtns").find('button[name="all"]')) {
        var projectBtns = $("#filterBtns").find('button[name!="all"]');
        var moduleList = [];

        for (var i = 0; i < projectBtns.length; i++) {
            var name = $(projectBtns[i]).attr("name");
            if (!arr[name]) {
                arr[name] = new Array();
            }
            var thisModule = $("#moduleList").find('button.on[data-project=' + name + ']').not(".not-work");
            for (var j = 0; j < thisModule.length; j++) {
                arr[name].push($(thisModule[j]).attr("name"));
            }
        }
    } else {
        var projectBtns = $("#filterBtns").find('button.on');
        var moduleList = [];

        for (var i = 0; i < projectBtns.length; i++) {
            var name = $(projectBtns[i]).attr("name");
            if (!arr[name]) {
                arr[name] = new Array();
            }
            var thisModule = $("#moduleList").find('button.on[data-project=' + name + ']').not(".not-work");
            for (var j = 0; j < thisModule.length; j++) {
                arr[name].push($(thisModule[j]).attr("name"));
            }
        }
    }
    // console.log(arr);
    $("#apiList").find('tr').removeClass("show");
    for (project in arr) {
        arr[project].forEach(function (item, index, arr) {
            $("#apiList").find('tr[data-project=' + project + '][name=' + item.toLowerCase() + ']').addClass("show");
        });
    }
};
var addApi = function (title, project, url, method, code) {
    $.ajax({
        type: "POST",
        url: "/addApi",
        dataType: "json",
        data: {
            title: title,
            project: project,
            url: url,
            method: method,
            code: code
        },
        success: function (data, status) {
            if (data.success) {
                $('#addApiModal').modal('hide');
                window.location.reload();
            }
        },
        fail: function (err, status) {
            console.log(err)
        }
    })
};
var editApi = function (id, title, project, url, method, code) {
    $.ajax({
        type: "POST",
        url: "/editApi",
        dataType: "json",
        data: {
            id: id,
            title: title,
            project: project,
            url: url,
            method: method,
            code: code
        },
        success: function (data, status) {
            if (data.success) {
                $('#addApiModal').modal('hide');
                window.location.reload();
            }
        },
        fail: function (err, status) {
            console.log(err)
        }
    })
}
$(function () {
    document.addEventListener('keydown', function (e) {
        if ($("#apiDetail").is(":visible")) {
            e = e || window.event;
            if (e.keyCode == 27) {
                $("#apiDetail").hide();
                e.preventDefault();
                return false;
            }
        }
    }, false);
    $("#apiDetail").on("click", ".close", function () {
        $("#apiDetail").hide();
    });
    $("#apiList").on("click", ".edit-api", function () {
        var _attrList = $(this).parent(".oper-list");
        var id = _attrList.attr("data-id");
        var title = _attrList.attr("data-title").trim();
        var project = _attrList.attr("data-project");
        var method = _attrList.attr("data-method");
        var urlNoPrefix = _attrList.attr("data-url");
        var url = "/api" + _attrList.attr("data-url").trim();
        if (title == "") {
            alert("标题不能为空");
            return;
        } else if (project == "") {
            alert("请选择项目");
            return;
        } else if (method == "") {
            alert("请选择method");
            return;
        } else if (url == "") {
            alert("请填写正确的url");
            return;
        }
        $.ajax({
            type: method,
            url: url,
            dataType: "json",
            success: function (data, status) {
                $("#operApiWrap").show();
                $("#operApiWrap").attr("data-type", "modify");

                $("#operApiId").val(id);
                $("#operApiTitle").val(title);
                $("#operApiProject").val(project);
                $("#operApiUrl").val(urlNoPrefix);
                $("#operApiMethod").val(method);

                $("#operApiCode").val(JSON.stringify(data, null, 4));
                $('#operApiCode').keyup();
            },
            fail: function (err, status) {
                console.log(err)
            }
        })
    });
    $("#apiList").on("click", ".view-detail", function () {
        var _attrList = $(this).parent(".oper-list");
        var title = _attrList.attr("data-title");
        var project = _attrList.attr("data-project");
        var method = _attrList.attr("data-method");
        var url = "/api" + _attrList.attr("data-url");
        var url2 = _attrList.attr("data-url");
        $.ajax({
            type: method,
            url: url,
            dataType: "json",
            success: function (data, status) {
                var info = [];
                info += '<p>标题：' + title + '</p>';
                info += '<p>项目：' + project + '</p>';
                info += '<p>方式：' + method + '</p>';
                info += '<p>地址：' + url2 + '</p>';
                $("#apiDetailInfo").html(info);
                $("#apiDetailCode pre").html(JSON.stringify(data, null, 4));
                $("#apiDetail").show();
            },
            fail: function (err, status) {
                console.log(err)
            }
        })
    });
    $("#apiList").on("click", ".delete-api", function () {
        var _attrList = $(this).parent(".oper-list");
        var id = _attrList.attr("data-id");
        if (confirm("真的要删除吗？")) {
            $.ajax({
                type: "POST",
                url: "/deleteApi",
                dataType: "json",
                data: {
                    id: id
                },
                success: function (data, status) {
                    if (data.message) {
                        window.location.reload();
                    }
                },
                fail: function (err, status) {
                    console.log(err)
                }
            })
        }
    });
    $("#wantAddApi").on("click", function () {
        $("#operApiWrap").show();
        $("#operApiWrap").attr("data-type", "add");
    });
    // 隐藏hideOperApiWrap
    $("#hideOperApiWrap").on("click", function () {
        $("#operApiWrap").hide();
        $("#operApiWrap").removeAttr("data-type");
        // 清空表单数据
        $("#operApiTitle").val("");
        // $("#operApiProject").val("");
        $("#operApiUrl").val("");
        $("#operApiOrginalUrl").val("");
        // $("#operApiMethod").val("");
        $("#operApiOrginalMethod").val("");
        $("#operApiCode").val("");

        $('#json-target').html('');
    });
    $("#confirmOperApiWrap").on("click", function () {
        var id = $("#operApiId").val();
        var title = $("#operApiTitle").val().trim();
        var project = $("#operApiProject").val();
        var url = $("#operApiUrl").val().trim();
        var method = $("#operApiMethod").val();
        var code = $("#operApiCode").val().trim();
        if (title == "") {
            alert("标题不能为空");
            return;
        } else if (project == "") {
            alert("请选择项目");
            return;
        } else if (method == "") {
            alert("请选择method");
            return;
        } else if (url == "") {
            alert("请填写正确的url");
            return;
        } else if (code == "") {
            alert("请填写code内容");
            return;
        }
        if ($("#operApiWrap").attr("data-type") == "add") {
            addApi(title, project, url, method, code);
        } else if ($("#operApiWrap").attr("data-type") == "modify") {
            editApi(id, title, project, url, method, code);
        }
    });
    $("#formatBtn").on("click", function () {
        $('#operApiCode').keyup();
        var parseCode = JSON.parse($("#operApiCode").val());
        var result = JSON.stringify(parseCode, null, 4);
        $("#operApiCode").val(result);
    });
    // 一级标签刷选
    $("#filterBtns").on("click", "button", function () {
        if ($(this).hasClass("on")) {
            return false;
        } else {
            $(this).addClass("on").siblings().removeClass("on");
            var name = $(this).attr("name");
            $("#moduleList button").addClass("on not-work");
            if (name == "all") {
                $("#moduleList button").removeClass("not-work");
                $("#apiList").removeClass("erp buy all").addClass("all");
                $("#moduleList button").addClass("on");
                showTr();
            } else {

                $("#apiList").removeClass("erp buy all").addClass(name);
                $("#moduleList").find('button[data-project|=' + name + ']').removeClass("not-work");
                $("#moduleList").find('button[data-project|=' + name + ']').addClass("on").siblings().not('button[data-project|=' + name + ']').removeClass("on not-work");
                showTr();
            }
        }
    });
    // 二级筛选
    $("#moduleList").on("click", "button", function () {
        var name = $(this).attr("name");
        $(this).removeClass("not-work");
        $(this).siblings("button.on").addClass("not-work");
        showTr();
    });
});