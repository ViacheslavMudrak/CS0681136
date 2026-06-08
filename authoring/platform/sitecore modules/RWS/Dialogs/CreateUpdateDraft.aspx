<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="CreateUpdateDraft.aspx.cs" Inherits="RWS.Sitecore.Tms.Connector.sitecore_modules.RWS.Dialogs.CreateUpdateDraft" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title></title>
    <style>
        :root,
        body,
        form {
            height: 100%;
        }

        .site-header {
            background-color: #ffffff;
            height: 40px;
        }

            .site-header img {
                width: 80px;
                padding-left: 15px;
            }

        main {
            position: relative;
        }

        .details__term label {
            margin-bottom: 0;
        }

        input,
        .listbox {
            border: 1px solid rgb(222, 226, 230);
            padding: 5px;
        }

        .multi__control {
            background: none;
            font-size: 24px;
            border: none;
            outline: none;
        }

        .listbox {
            min-width: 100px;
            float: left;
            padding: 5px;
        }

        .textbox {
            min-width: 100%;
        }

        .depth__textbox {
            display: block;
        }

        .projectName {
            width: 440px;
        }

        textarea {
            width: 400px;
        }

        .moveItem {
            float: left;
        }

        .fontFromSitecore {
            font-family: "Open Sans", Arial, sans-serif;
            font-size: 13px;
            font-weight: 400;
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


        .scWizardButtons {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
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

        .btn-general {
            box-shadow: unset;
            margin: 10px 0 0 15px;
        }

        .content {
            padding: 20px 20px 60px;
        }

        .theme--a {
            background-color: rgba(0, 0, 0, 0.05);
            border: 1px solid rgb(222, 226, 230);
        }

        .details {
            padding: 10px 20px;
        }

        .details__related {
            padding: 10px 20px;
            margin-bottom: 15px;
        }

        .details__row {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            padding: 10px 0;
            margin-bottom: 10px;
        }

        .details__row--alt {
            align-items: flex-start;
        }

        .details__term {
            margin-right: 10px;
        }

        .details__definition {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
        }

        .tab-pane {
            padding: 20px 0;
        }

        .drafts {
            padding: 0;
        }

        .draft {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 10px 10px;
            margin-bottom: 10px;
        }

        .selector-area {
            text-align: center;
        }

        .selector-ddl {
            font-size: 14px;
            padding: 4px;
            min-width: 280px;
        }

        .selector-row {
            display: block;
            padding: 5px 0;
            margin-bottom: 10px;
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

        .extended__checkbox {
            margin-bottom: .5rem;
            margin-left: .5rem;
            display: flex;
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.css" />
    <link rel="stylesheet" href="https://cdn.datatables.net/1.10.16/css/dataTables.bootstrap4.min.css" />
</head>
<body class="fontFromSitecore">
    <!-- HEADER -->
    <header class="site-header row no-gutters align-items-center">
        <img src="/sitecore modules/RWS/images/Trados_logo-rgb.png" class="scRibbonToolbarLargeButtonIcon">
    </header>

    <!-- MAIN -->
    <main role="main">

        <form runat="server" id="form1" class="text">
            <asp:ScriptManager ID="ScriptManager1" runat="server">
            </asp:ScriptManager>

            <div runat="server" id="spinner" class="loading"></div>

            <section runat="server" id="draftProjectSelect" class="content">
                <div class="selector-area">
                    <header class="content_header selector-row">
                        <asp:Literal runat="server" ID="lblSelectDraftProjectText" />
                    </header>
                    <div class="selector-row">
                        <asp:DropDownList ID="ddlDraftProjectSelector" runat="server" OnSelectedIndexChanged="ddlDraftProjectSelector_SelectedIndexChanged" AutoPostBack="true" CssClass="selector-ddl"></asp:DropDownList>
                    </div>
                    <div class="selector-row">
                        <asp:Button ID="btnSelectDraftProject" runat="server" Text="Select" OnClick="btnSelectDraftProject_Click" class="btn-general btn-loader active" />
                    </div>
                    <div class="selector-row">
                        <br />
                        <asp:Literal runat="server" ID="lblOrText" />
                    </div>
                    <div class="selector-row">
                        <asp:Button ID="btnCreateNewDraftProject" runat="server" Text="Create New Draft Project" OnClick="btnCreateNewDraftProject_Click" class="btn-general btn-loader active" />
                    </div>
                </div>
            </section>

            <section runat="server" id="createDraft" class="content">

                <header class="content__header">
                    <label runat="server" id="lblSubtitle"></label>
                </header>

                <section runat="server" id="depthOptions_createDraft" visible="false">
                    <div class="details__related theme--a">
                        <label runat="server" id="lblRelatedItems_selectDepth_create"></label>
                        <asp:TextBox runat="server" CssClass="depth__textbox" ID="txtRelatedItems_depth_create"></asp:TextBox>
                        <div class="details__row">
                            <label runat="server" id="lblEnable_extended_subitems_selection"></label>
                            <asp:CheckBox runat="server" CssClass="extended__checkbox" ID="chbEnable_extended_subitems_selection" />
                        </div>
                    </div>
                </section>
                <div class="content__main">
                    <dl class="details theme--a">
                        <div class="details__row">
                            <dt class="details__term">
                                <asp:Literal runat="server" ID="lblProjectName" />
                            </dt>
                            <dd class="details__definition">
                                <asp:TextBox ID="tbProjectName" runat="server" class="scInstallerField textbox projectName" />
                            </dd>
                        </div>
                        <div class="details__row">
                            <dt class="details__term">
                                <asp:Literal runat="server" ID="lblProjectDescription" />
                            </dt>
                            <dd class="details__definition">
                                <asp:TextBox ID="tbProjectDescription" runat="server" class="scInstallerField textbox" TextMode="MultiLine" Rows="3" />
                            </dd>
                        </div>
                        <div class="details__row">
                            <dt class="details__term">
                                <asp:Literal runat="server" ID="lblCreatedBy" />
                            </dt>
                            <dd class="details__definition">
                                <asp:Literal runat="server" ID="spCreatedBy" />
                            </dd>
                        </div>

                        <div class="row no-gutters">
                            <asp:UpdatePanel ID="up" runat="server">
                                <ContentTemplate>
                                    <div runat="server" id="sourceNotSupportedContainer" class="details__row red" visible="false">
                                        <dt class="details__term">
                                            <asp:Label runat="server" ID="sourceNotSupported" class="fontFromSitecore" />
                                        </dt>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblProjectOption" />Project Option:
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:DropDownList runat="server" ID="ddlProjectOptions"
                                                OnSelectedIndexChanged="ddlProjectOptions_SelectedIndexChanged" AutoPostBack="True">
                                            </asp:DropDownList>
                                        </dd>
                                    </div>
                                    <asp:Panel ID="pnlControls" runat="server" ></asp:Panel>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblSourceLanguageOption" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:DropDownList ID="ddlSourceLanguageOptions" runat="server"
                                                OnSelectedIndexChanged="ddlSourceLanguageOptions_SelectedIndexChanged" AutoPostBack="True">
                                            </asp:DropDownList>
                                        </dd>
                                    </div>
                                    <div class="details__row">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblDestinationLanguages" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:ListBox ID="lbDestinationLanguages" runat="server" SelectionMode="Multiple" CssClass="listbox"></asp:ListBox>
                                            <div>
                                                <asp:ImageButton ID="ImageButton1" runat="server" OnClick="btnSelectDestinationLanguages_Click"
                                                    ImageUrl="/sitecore modules/RWS/images/btnMoveRight2.png" CssClass="moveItem" />
                                                <br />
                                                <asp:ImageButton ID="ImageButton2" runat="server" OnClick="btnUnselectDestinationLanguages_Click"
                                                    ImageUrl="/sitecore modules/RWS/images/btnMoveLeft2.png" CssClass="moveItem" />
                                            </div>
                                            <asp:ListBox ID="lbSelectedDestinationLanguages" runat="server" SelectionMode="Multiple" CssClass="listbox"></asp:ListBox>
                                        </dd>
                                    </div>
                                    <div runat="server" id="DivDueDate" class="details__row" visible="False">
                                        <dt class="details__term">
                                            <asp:Literal runat="server" ID="lblDueDate" />
                                        </dt>
                                        <dd class="details__definition">
                                            <asp:TextBox ID="tbDueDate" TextMode="Date" runat="server" class="scInstallerField" />
                                        </dd>
                                    </div>

                                    <div class="scWizardButtons">
                                        <asp:Button runat="server" ID="btnContinueAndSend"
                                            OnClick="btnContinueAndSend_Click" CausesValidation="false" CssClass="scButton scButtonPrimary btn-loader" ClientIDMode="Static" />
                                        <asp:Button runat="server" ID="btnContinue"
                                            OnClick="btnContinue_Click" CssClass="scButton scButtonPrimary btn-loader" />
                                        <asp:Button runat="server" ID="btnCancel"
                                            OnClick="BtnCancel_Click" CausesValidation="false" CssClass="scButton" />
                                    </div>
                                </ContentTemplate>
                                <Triggers>
                                    <asp:PostBackTrigger ControlID="btnCancel" />
                                    <asp:PostBackTrigger ControlID="btnContinue" />
                                    <asp:PostBackTrigger ControlID="btnContinueAndSend" />
                                </Triggers>
                            </asp:UpdatePanel>
                        </div>
                    </dl>
                </div>

            </section>

            <section runat="server" id="updateDraft" visible="false" class="content">
                <header class="content__header">
                    <label runat="server" id="lblSubtitle_updateDraft"></label>
                </header>

                <section runat="server" id="depthOptions_updateDraft" visible="false">
                    <div class="details__related theme--a">
                        <label runat="server" id="lblRelatedItems_selectDepth"></label>
                        <asp:TextBox runat="server" CssClass="depth__textbox" ID="txtRelatedItems_depth"></asp:TextBox>
                    </div>
                </section>

                <div class="content__main">
                    <dl class="details theme--a">
                        <div class="details__row">
                            <dt class="details__term">
                                <asp:Literal runat="server" ID="lblProjectName_updateDraft" />
                            </dt>
                            <dd class="details__definition">
                                <asp:Label runat="server" ID="lblProjectName_updateDraft_Value" />
                            </dd>
                        </div>
                        <div class="details__row">
                            <dt class="details__term">
                                <asp:Literal runat="server" ID="lblCreatedBy_updateDraft" />
                            </dt>
                            <dd class="details__definition">
                                <asp:Label runat="server" ID="spCreatedBy_updateDraft_Value" />
                            </dd>
                        </div>
                        <div class="details__row">
                            <dt class="details__term">
                                <asp:Literal runat="server" ID="lblProjectOptions_updateDraft" />
                            </dt>
                            <dd class="details__definition">
                                <asp:Label runat="server" ID="spProjectOption_updateDraft_Value" />
                            </dd>
                        </div>
                        <div class="details__row">
                            <dt class="details__term">
                                <asp:Literal runat="server" ID="lblSourceLanguage_updateDraft" />
                            </dt>
                            <dd class="details__definition">
                                <asp:Label runat="server" ID="spSourceLanguage_updateDraft_Value" />
                            </dd>
                        </div>
                        <div class="details__row">
                            <dt class="details__term">
                                <asp:Literal runat="server" ID="lblDestinationLanguages_updateDraft" />
                            </dt>
                            <dd class="details__definition">
                                <asp:Label runat="server" ID="spDestinationLanguages_updateDraft_Value" />
                            </dd>
                        </div>
                    </dl>
                </div>
                <div class="scWizardButtons">
                    <asp:Button runat="server" ID="btnContinue_updateAndStartDraft"
                        OnClick="BtnUpdateAndStart_Click" CssClass="scButton scButtonPrimary btn-loader" />
                    <asp:Button runat="server" ID="btnContinue_updateDraft"
                        OnClick="BtnUpdate_Click" CssClass="scButton scButtonPrimary" />
                    <asp:Button runat="server" ID="btnCancel_updateDraft"
                        OnClick="BtnCancel_Click" CausesValidation="false" CssClass="scButton" />
                </div>
            </section>

            <section runat="server" id="final" visible="false">
                <div runat="server" id="divSuccess" class="row no-gutters rowSpacer" visible="false">
                    <asp:Label runat="server" ID="lblThankYou" />
                </div>
                <div runat="server" id="divFailure" visible="false" class="row no-gutters rowSpacer">
                    <div>Process has failed.</div>
                </div>
                <div class="scWizardButtons">
                    <asp:Button runat="server" ID="createProjectOk" CssClass="scButton scButtonPrimary"
                        OnClick="BtnCancel_Click" CausesValidation="false" />
                </div>
            </section>
        </form>
    </main>
    <script type="text/javascript">
        function AddButtonEvents() {
            $(document).on('click', '.btn-loader', function () {
                $('#spinner').show();
            });
        }

        document.addEventListener('DOMContentLoaded', function () {
            AddButtonEvents();
        }, false);
    </script>
</body>
</html>
