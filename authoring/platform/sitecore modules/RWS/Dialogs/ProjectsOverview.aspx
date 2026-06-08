<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="ProjectsOverview.aspx.cs" Inherits="RWS.Sitecore.Tms.Connector.sitecore_modules.RWS.Dialogs.ProjectsOverview" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <style>
        .site-header {
            background-color: #ffffff;
            height: 40px;
        }

            .site-header img {
                width: 80px;
                padding-left: 15px;
            }

        .content {
            padding: 20px;
        }

        input,
        .listbox {
            border: 1px solid rgb(222, 226, 230);
            padding: 5px;
        }

            .scButtonPrimary,
            input[type="submit"].scButtonPrimary {
                background-repeat: repeat-x;
                border-color: #207da2;
                -webkit-box-shadow: inset 0 1px #5dbadf;
                box-shadow: inset 0 1px #5dbadf;
                color: #fff;
                background-color: #207da2;
                background-image: linear-gradient(to bottom, #289bc8 0%, #207da2 100%);
                -moz-border-radius: 6px;
                -webkit-border-radius: 6px;
                border-radius: 6px;
            }

                .scButtonPrimary:hover,
                input[type="submit"].scButtonPrimary:hover {
                    background-repeat: repeat-x;
                    border-color: #175973;
                    background-color: #1d7395;
                    background-position: 0 0;
                    background-image: linear-gradient(to bottom, #289bc8 0%, #289bc8 100%);
                }

                .scButtonPrimary:active,
                input[type="submit"].scButtonPrimary:active {
                    background-color: #1d7395;
                    background-image: -webkit-linear-gradient(top, #207da2 0%, #207da2 100%);
                    background-image: -o-linear-gradient(top, #207da2 0%, #207da2 100%);
                    background-image: linear-gradient(to bottom, #207da2 0%, #207da2 100%);
                    background-repeat: repeat-x;
                    -webkit-box-shadow: inset 0 3px 3px #13485e;
                    box-shadow: inset 0 3px 3px #13485e;
                    background-image: none;
                    border-color: #175973;
                }

            .scButton,
            input[type="submit"] {
                display: inline-block;
                margin-bottom: 0;
                font-weight: normal;
                text-align: center;
                vertical-align: middle;
                cursor: pointer;
                border: 1px solid #bdbdbd;
                white-space: nowrap;
                padding: 8px 12px;
                font-size: 12px;
                line-height: 1.42857143;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                min-width: 80px;
                height: 36px;
                text-shadow: none;
                margin-left: 10px;
                background-repeat: repeat-x;
                -webkit-box-shadow: inset 0 1px #ffffff;
                box-shadow: inset 0 1px #ffffff;
                text-shadow: none;
                background-color: #d9d9d9;
                background-image: linear-gradient(to bottom, #f0f0f0 0%, #d9d9d9 100%);
                -moz-border-radius: 6px;
                -webkit-border-radius: 6px;
                border-radius: 6px;
            }

                .scButton:hover,
                input[type="submit"]:hover {
                    background-repeat: repeat-x;
                    border-color: #bdbdbd;
                    background-color: #d1d1d1;
                    background-position: 0 0;
                    background-image: linear-gradient(to bottom, #f0f0f0 0%, #f0f0f0 100%);
                }

        .rowSpacer {
            height: 30px;
            padding-left: 15px;
        }

        .scWizardButtons {
            position: absolute;
            width: 100%;
            bottom: 0;
            height: 56px;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            padding: 8px 15px 9px;
            text-align: right;
            background: #f0f0f0;
            white-space: nowrap;
            line-height: 34px;
            border-top: 1px solid #e3e3e3;
        }

        .fontFromSitecore {
            font-family: "Open Sans", Arial, sans-serif;
            font-size: 13px;
            font-weight: 400;
        }


        ul.nav-tabs li.active {
            background-color: #474747;
        }

        a.nav-link {
            color: #5e5e5e;
        }

        li:not(.active) a.nav-link:hover {
            color: #5e5e5e;
            background-color: #e3e3e3;
        }

        li.active a.nav-link {
            color: white;
        }

        .noMargin {
            margin: 0px;
        }

        #projectOverview .btn {
            margin: 0 0 10px;
        }

            #projectOverview .btn:not(.btn-loader) {
                width: 100%;
            }

        #projectOverview .btn-refresh {
            box-shadow: unset;
            margin: 10px 0 0 15px;
        }

        #projectOverview .btn-archiveall {
            float: right;
            box-shadow: unset;
            margin: 10px 15px 0 0px;
        }

        #projectOverview .btn:not(.btn-refresh):not(.btn-archiveall) {
            width: 100%;
            margin-bottom: 10px;
        }

        #projectOverview .table {
            display: block;
            margin-bottom: 10px;
            overflow: auto;
            width: 100%;
            font-size: 14px;
        }

        /* Absolute Center Spinner */
        .loading {
            position: fixed;
            z-index: 999;
            height: 2em;
            width: 2em;
            overflow: visible;
            margin: auto;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
        }

            /* Transparent Overlay */
            .loading:before {
                content: '';
                display: block;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.3);
            }

            /* :not(:required) hides these rules from IE9 and below */
            .loading:not(:required) {
                /* hide "loading..." text */
                font: 0/0 a;
                color: transparent;
                text-shadow: none;
                background-color: transparent;
                border: 0;
            }

                .loading:not(:required):after {
                    content: '';
                    display: block;
                    font-size: 10px;
                    width: 1em;
                    height: 1em;
                    margin-top: -0.5em;
                    -webkit-animation: spinner 1500ms infinite linear;
                    -moz-animation: spinner 1500ms infinite linear;
                    -ms-animation: spinner 1500ms infinite linear;
                    -o-animation: spinner 1500ms infinite linear;
                    animation: spinner 1500ms infinite linear;
                    border-radius: 0.5em;
                    -webkit-box-shadow: rgba(0, 0, 0, 0.75) 1.5em 0 0 0, rgba(0, 0, 0, 0.75) 1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) 0 1.5em 0 0, rgba(0, 0, 0, 0.75) -1.1em 1.1em 0 0, rgba(0, 0, 0, 0.5) -1.5em 0 0 0, rgba(0, 0, 0, 0.5) -1.1em -1.1em 0 0, rgba(0, 0, 0, 0.75) 0 -1.5em 0 0, rgba(0, 0, 0, 0.75) 1.1em -1.1em 0 0;
                    box-shadow: rgba(0, 0, 0, 0.75) 1.5em 0 0 0, rgba(0, 0, 0, 0.75) 1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) 0 1.5em 0 0, rgba(0, 0, 0, 0.75) -1.1em 1.1em 0 0, rgba(0, 0, 0, 0.75) -1.5em 0 0 0, rgba(0, 0, 0, 0.75) -1.1em -1.1em 0 0, rgba(0, 0, 0, 0.75) 0 -1.5em 0 0, rgba(0, 0, 0, 0.75) 1.1em -1.1em 0 0;
                }

        .partialdownloadlbl {
            font-size: 10px;
        }

        /* Animation */

        @-webkit-keyframes spinner {
            0% {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
            }

            100% {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }

        @-moz-keyframes spinner {
            0% {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
            }

            100% {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }

        @-o-keyframes spinner {
            0% {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
            }

            100% {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }

        @keyframes spinner {
            0% {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
            }

            100% {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }
    </style>
    <script defer src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.js"></script>
    <script defer src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"></script>
    <script defer src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.css" />
    <link rel="stylesheet" href="https://cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css" />
</head>

<body class="fontFromSitecore">

    <!-- HEADER -->
    <header class="site-header row no-gutters align-items-center">
        <img src="/sitecore modules/RWS/images/Trados_logo-rgb.png" class="scRibbonToolbarLargeButtonIcon">
    </header>

    <!-- MAIN -->
    <main role="main">
        <form id="form1" runat="server">
            <asp:ScriptManager ID="ScriptManager1" runat="server">
            </asp:ScriptManager>

            <div runat="server" id="spinner" class="loading"></div>

            <!-- CONTENT: Start -->
            <section runat="server" id="projectOverview">
                <asp:Button ID="btnRefresh" runat="server" Text="Refresh" OnClick="btnRefresh_Click" class="btn btn-info btn-refresh btn-loader btn-sm active" />
                <asp:Button ID="btnArchiveAll" runat="server" Text="Archive All Completed" OnClientClick="ConfirmArchiveAll()" OnClick="btnArchiveAll_Click" class="btn btn-secondary btn-loader btn-archiveall btn-sm active" />
                <div id="projOverview_wrapper" class="content dataTables_wrapper dt-bootstrap4 no-footer">
                    <table class="table table-striped table-bordered  table-fit dataTable no-footer" id="projOverview" role="grid"
                        aria-describedby="projOverview_info">
                        <asp:Repeater ID="rptProjects" runat="server" OnItemDataBound="rptProjects_ItemDataBound">
                            <HeaderTemplate>
                                <thead>
                                    <tr role="row">
                                        <th scope="col" class="sorting_asc" tabindex="0" aria-controls="projOverview" rowspan="1"
                                            colspan="1" aria-sort="ascending" aria-label="#: activate to sort column descending">#</th>
                                        <th scope="col" class="sorting_asc" tabindex="0" aria-controls="projOverview" rowspan="1"
                                            colspan="1" aria-sort="ascending" aria-label="ID: activate to sort column descending">Id</th>
                                        <th scope="col" class="sorting_asc" tabindex="0" aria-controls="projOverview" rowspan="1"
                                            colspan="1" aria-sort="ascending" aria-label="Name: activate to sort column descending">Name</th>
                                        <th scope="col" class="sorting_asc" tabindex="0" aria-controls="projOverview" rowspan="1"
                                            colspan="1" aria-sort="ascending" aria-label="Created By: activate to sort column descending">Created By</th>
                                        <th scope="col" class="sorting_asc" tabindex="0" aria-controls="projOverview" rowspan="1"
                                            colspan="1" aria-sort="ascending" aria-label="Languages: activate to sort column descending">Languages</th>
                                        <th scope="col" class="sorting_asc" tabindex="0" aria-controls="projOverview" rowspan="1"
                                            colspan="1" aria-sort="ascending" aria-label="Options: activate to sort column descending">Options
                                        </th>
                                        <th scope="col" class="sorting_asc" tabindex="0" aria-controls="projOverview" rowspan="1"
                                            colspan="1" aria-sort="ascending" aria-label="Due Date: activate to sort column descending">Due Date
                                        </th>
                                        <th scope="col" class="sorting_asc" tabindex="0" aria-controls="projOverview" rowspan="1"
                                            colspan="1" aria-sort="ascending" aria-label="Delivered: activate to sort column descending">Delivered</th>
                                        <th scope="col" class="sorting_asc" tabindex="0" aria-controls="projOverview" rowspan="1"
                                            colspan="1" aria-sort="ascending" aria-label="Status: activate to sort column descending">Status
                                        </th>
                                        <th scope="col" class="sorting_asc" tabindex="0" aria-controls="projOverview" rowspan="1"
                                            colspan="1" aria-sort="ascending" aria-label="Cost: activate to sort column descending">Cost</th>
                                        <th scope="col">Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                            </HeaderTemplate>
                            <ItemTemplate>
                                <tr role="row" class="odd">
                                    <th scope="row"><%# Container.ItemIndex + 1 %></th>
                                    <td><%#Eval("ProviderProjectId")%></td>
                                    <td><%#Eval("ProjectName")%></td>
                                    <td>
                                        <asp:Literal ID="litCreatedDate" runat="server" />,
                                        <asp:Label ID="lblUpdatedBy" runat="server" />&nbsp;
                                        <asp:Literal ID="litCreatedBy" runat="server" />
                                    </td>
                                    <td>
                                        <asp:Literal ID="liAddedItems" runat="server" />
                                        <asp:Label ID="lblSitecoreItems" runat="server" />,
                                        <asp:Label ID="lblFrom" runat="server" />
                                        <asp:Literal ID="litSourceLanguage" runat="server" />
                                        <asp:Label ID="lblTo" runat="server" />
                                        <asp:Literal ID="litDestinationLanguages" runat="server" />
                                    </td>
                                    <td><%#Eval("ProjectOptions")%></td>
                                    <td><%#Eval("ProjectDueDate")%></td>
                                    <td><%#Eval("ProjectDelivered")%></td>
                                    <td><%#Eval("Status")%></td>
                                    <td><%#Eval("Cost")%></td>
                                    <td>
                                        <asp:LinkButton runat="server" ID="btnOpenDraft" CommandArgument='<%#Eval("Path")%>'
                                            class="btn btn-info btn-sm"></asp:LinkButton>
                                        <asp:LinkButton runat="server" ID="btnApprove" CommandArgument='<%#Eval("Path")%>'
                                            class="btn btn-success btn-sm btn-loader"></asp:LinkButton>
                                        <asp:LinkButton runat="server" ID="btnCancel" CommandArgument='<%#Eval("Path")%>'
                                            class="btn btn-danger btn-sm btn-loader"></asp:LinkButton>
                                        <asp:LinkButton runat="server" ID="btnComplete" CommandArgument='<%#Eval("Path")%>'
                                            class="btn btn-dark btn-sm btn-loader"></asp:LinkButton>
                                        <asp:LinkButton runat="server" ID="btnUpdate" CommandArgument='<%#Eval("Path")%>'
                                            class="btn btn-primary btn-sm btn-loader" AutoPostBack="True"></asp:LinkButton>
                                        <asp:LinkButton runat="server" ID="btnArchive" CommandArgument='<%#Eval("Path")%>'
                                            class="btn btn-secondary btn-sm btn-loader"></asp:LinkButton>
                                        <asp:Label ID="lblPartialDownloadStatus" class="partialdownloadlbl" runat="server" />
                                    </td>
                                </tr>
                            </ItemTemplate>
                            <FooterTemplate>
                                </tbody>
          </table>
                            </FooterTemplate>
                        </asp:Repeater>
                    </table>
                </div>
            </section>

            <section runat="server" id="initiatedProject" visible="false">
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item active">
                        <a class="nav-link" id="projectDetailsTab-tab" data-toggle="tab" href="#projectDetailsTab" role="tab"
                            aria-controls="projectDetailsTab" aria-selected="true">
                            <label runat="server" class="noMargin" id="projectDetailsTabText"></label>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="projectItemsTab-tab" data-toggle="tab" href="#projectItemsTab" role="tab"
                            aria-controls="projectItemsTab" aria-selected="false">
                            <label runat="server" class="noMargin" id="projectItemsTabText"></label>
                        </a>
                    </li>
                </ul>

                <div class="tab-content" id="myTabContent">
                    <div class="tab-pane fade show active" id="projectDetailsTab" role="tabpanel"
                        aria-labelledby="projectDetailsTab-tab">
                        <div class="content">
                            <header class="content__header">
                                <h6>Project Details</h6>
                                <p>Details about the selected project:</p>
                            </header>
                            <div class="content__main">
                                <dl class="details theme--a">
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblScProjectName_Initiated" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lbl_ProjectName" />
                                        </dd>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblBy_Initiated" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lbl_CreatedBy" />
                                        </dd>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lbl_On" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lbl_Date" />
                                        </dd>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblSCMethod_Initiated" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lbl_Method" />
                                        </dd>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblScItemsFrom_Initiated" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lbl_SourceLanguage" />
                                        </dd>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblScTargetLanguages_Initiated" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lblTargetLang" />
                                        </dd>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblSCLocation_Initiated" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lbl_Location" />
                                        </dd>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblSCStatus_Initiated" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lbl_Status" />
                                        </dd>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblSCDueDate_Initiated" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:Literal runat="server" ID="lbl_Updated" />
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <div class="tab-pane fade show" id="projectItemsTab" role="tabpanel" aria-labelledby="projectItemsTab-tab">
                        <div class="content">
                            <header class="content__header">
                                <h6>Project Items</h6>
                                <asp:Literal runat="server" ID="lblSubtitle"></asp:Literal>
                            </header>
                            <div class="content__main">

                                <div class="row no-gutters">
                                    <asp:UpdatePanel runat="server" ID="UpdatePanel1">
                                        <ContentTemplate>
                                            <asp:Repeater runat="server" ID="rptProjectItems">
                                                <ItemTemplate>
                                                    <div class="draft theme--a" id="up">
                                                        <%-- ReSharper disable once RedundantCast --%>
                                                        <span><%# ((RepeaterItem)Container).DataItem.ToString() %></span>
                                                    </div>
                                                </ItemTemplate>
                                            </asp:Repeater>
                                        </ContentTemplate>
                                    </asp:UpdatePanel>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section runat="server" id="ActionResultPanel" visible="false">
                <div runat="server" class="scWizardButtons" id="btnGoBackContainer">
                    <asp:Button runat="server" OnClick="GoBack_Click" ID="btnGoBack" CssClass="scButton scButtonPrimary" />
                </div>
            </section>

            <!-- CONTENT: End -->
        </form>
    </main>
    <script type="text/javascript">
        function AddButtonEvents() {
            $('.btn-loader').click(function () {
                $('#spinner').show();
            });
        }

        function ConfirmArchiveAll(message) {
            var confirm_archive_value = document.createElement("INPUT");
            confirm_archive_value.type = "hidden";
            confirm_archive_value.name = "confirm_archive_value";
            if (!message) {
                message = "Are you sure you want to archive all completed projects?"
            }
            if (confirm(message)) {
                confirm_archive_value.value = "Yes";
            } else {
                confirm_archive_value.value = "No";
            }
            document.forms[0].appendChild(confirm_archive_value);
        }

        document.addEventListener('DOMContentLoaded', function () {
            var projectOverview = $('#projOverview');
            if (projectOverview) {
                projectOverview.DataTable({
                    paging: true,
                    ordering: true,
                    responsive: true,
                    searching: true,
                    stateSave: true
                });
            };

            AddButtonEvents();

            $('#projOverview').on('draw.dt', function () {
                AddButtonEvents();
            });

            var iFrame = parent.document.getElementById("scContentIframeId0");
            var iFrameContent = "div[aria-describedby='scContentIframeId0']";
            if (!iFrame)
                return;

            function styleIframe(height, width) {
                iFrame.style.height = height;
                $(iFrameContent, parent.document).css('width', width);
            }

            var initiatedProject = document.getElementById("initiatedProject");
            if (initiatedProject) {
                styleIframe("650px", "600px");
            } else {
                styleIframe("650px", "1200px");
            }
        }, false);
    </script>
</body>

</html>
