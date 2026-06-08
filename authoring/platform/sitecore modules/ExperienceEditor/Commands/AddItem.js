define(['sitecore', '/-/speak/v1/ExperienceEditor/ExperienceEditor.js'], function (Sitecore, ExperienceEditor) {

    Sitecore.Commands.AddItem = {
        canExecute: function (context) {
            return true;
        },

        execute: function (context) {
            context.currentContext.argument = context.button.viewModel.$el[0].accessKey;
            console.log(context.currentContext.argument);

            ExperienceEditor.PipelinesUtil.generateRequestProcessor('ExperienceEditor.AddItemProcessor', function (response) {
                var url = response.responseValue.value;
                if (!url) {
                    alert('The item could not be added to a draft project.');
                    return;
                }

                var dialogFeatures = 'dialogHeight: 720px;dialogWidth: 700px;';
                ExperienceEditor.Dialogs.showModalDialog(url, '', dialogFeatures, null);
            }).execute(context);
        }
    };
});