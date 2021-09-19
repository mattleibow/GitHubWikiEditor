using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using System;
using System.Threading.Tasks;

namespace GitHubWikiEditor.Shared
{
	public partial class SimpleMDE : IDisposable
	{
		ElementReference simplemde;
		DotNetObjectReference<TextChangedHelper> textChangedAction;

		[Inject]
		IJSRuntime JS { get; set; }

		[Parameter]
		public EventCallback<TextChangedArgs> OnTextChanged { get; set; }

		protected override void OnInitialized()
		{
			var helper = new TextChangedHelper(TextChanged);
			textChangedAction = DotNetObjectReference.Create(helper);
		}

		protected override async Task OnAfterRenderAsync(bool firstRender)
		{
			if (firstRender)
			{
				await JS.InvokeVoidAsync("BlazorEditor.Editor.init", simplemde, textChangedAction, Guid.NewGuid());
			}
		}

		public async void UpdateText(TextChangedArgs args)
		{
			await JS.InvokeVoidAsync("BlazorEditor.Editor.update", simplemde, args);
		}

		async void TextChanged(TextChangedArgs args)
		{
			await OnTextChanged.InvokeAsync(args);
		}

		void IDisposable.Dispose()
		{
			textChangedAction.Dispose();
		}

		public class TextChangedHelper
		{
			public TextChangedHelper(Action<TextChangedArgs> action)
			{
				Action = action;
			}

			public Action<TextChangedArgs> Action { get; }

			[JSInvokable("Invoke")]
			public void Invoke(TextChangedArgs args) => Action.Invoke(args);
		}
	}

	public record TextChangedArgs(string Text, int From, int To, string Id = null);
}