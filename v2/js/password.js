/**
 * @module Password
 * @desc This is a password component to set password in form of images (emojis)
 * @vue-event {String} passwordSet - Emit set password text in form of letters when 'enter' key pressed
 */
const Password ={
	name: 'Password',
	template: `<div class="password-class">
				<div class="password-line">
					<div class="password-label"></div>
					<div class="password-input">
						<input 
							class="password-value" id="text" ref="password"
							v-on:keyup="keyEntered"
							type="text"
							v-bind:value="passwordValue"
						/>
						<div v-if="showCancel"
							class="password-iconcancel"
							v-on:click="cancelClicked"
						></div>
					</div>
					<div>
						<div class="password-emojis" v-if="this.currentEmojis.length==10">
							<div class="emojiset1">
								<div class="emoji"
									v-for='index in 5' :key='index'
									v-on:click="emojiClicked($event, index-1)"
								>
									<div class="emoji-icon" v-html="'&#x'+this.currentEmojis[index-1].value"></div>
									<div class="emoji-letter">{{this.currentEmojis[index-1].letter}}</div>
								</div>
							</div>
							<div class="emojiset2">
								<div class="emoji"
									v-for='index in 5' :key='index'
									v-on:click="emojiClicked($event, index+4)"
								>
									<div class="emoji-icon" v-html="'&#x'+this.currentEmojis[index+4].value"></div>
									<div class="emoji-letter">{{this.currentEmojis[index+4].letter}}</div>
								</div>
							</div>
						</div>
						<div class="password-emojis-category">
							<div ref="category0" class="emoji-category emoji-selected" v-on:click="category0Clicked">
								<div class="emoji-category-icon" v-html="'&#x'+this.emojisData[category0Index].value"></div>
							</div>
							<div ref="category1" class="emoji-category emoji-unselected" v-on:click="category1Clicked">
								<div class="emoji-category-icon" v-html="'&#x'+this.emojisData[category1Index].value"></div>
							</div>
							<div ref="category2" class="emoji-category emoji-unselected" v-on:click="category2Clicked">
								<div class="emoji-category-icon" v-html="'&#x'+this.emojisData[category2Index].value"></div>
							</div>
						</div>
					</div>
				</div>
			</div>`,
	data() {
		return {
			showCancel: false,
			passwordValue: '',
			passwordText: '',
			currentEmojis: [],
			currentIndex: null,
			category0Index: 0,
			category1Index: 10,
			category2Index: 20,
			emojisData: [
				{"name": "dog", "value": "1F436", "letter": "a", "category": "animal"},
				{"name": "cat", "value": "1F431", "letter": "b", "category": "animal"},
				{"name": "cow", "value": "1F42E", "letter": "c", "category": "animal"},
				{"name": "horse", "value": "1F434", "letter": "d", "category": "animal"},
				{"name": "pig", "value": "1F437", "letter": "e", "category": "animal"},
				{"name": "mouse", "value": "1F42D", "letter": "f", "category": "animal"},
				{"name": "rabbit", "value": "1F430", "letter": "g", "category": "animal"},
				{"name": "bear", "value": "1F43B", "letter": "h", "category": "animal"},
				{"name": "chicken", "value": "1F414", "letter": "i", "category": "animal"},
				{"name": "fish", "value": "1F41F", "letter": "j", "category": "animal"},
			
				{"name": "smiling", "value": "1F60A", "letter": "k", "category": "emoticon"},
				{"name": "winking", "value": "1F609", "letter": "l", "category": "emoticon"},
				{"name": "angry", "value": "1F620", "letter": "m", "category": "emoticon"},
				{"name": "grinning", "value": "1F600", "letter": "n", "category": "emoticon"},
				{"name": "heart-eyes", "value": "1F60D", "letter": "o", "category": "emoticon"},
				{"name": "sunglasses", "value": "1F60E", "letter": "p", "category": "emoticon"},
				{"name": "pensive", "value": "1F614", "letter": "q", "category": "emoticon"},
				{"name": "astonished", "value": "1F632", "letter": "r", "category": "emoticon"},
				{"name": "crying", "value": "1F622", "letter": "s", "category": "emoticon"},
				{"name": "screaming", "value": "1F631", "letter": "t", "category": "emoticon"},
			
				{"name": "apple", "value": "1F34E", "letter": "u", "category": "food"},
				{"name": "banana", "value": "1F34C", "letter": "v", "category": "food"},
				{"name": "grapes", "value": "1F347", "letter": "w", "category": "food"},
				{"name": "cherry", "value": "1F352", "letter": "x", "category": "food"},
				{"name": "strawberry", "value": "1F353", "letter": "y", "category": "food"},
				{"name": "hamburger", "value": "1F354", "letter": "z", "category": "food"},
				{"name": "pizza", "value": "1F355", "letter": "0", "category": "food"},
				{"name": "cake", "value": "1F382", "letter": "1", "category": "food"},
				{"name": "cocktail", "value": "1F378", "letter": "2", "category": "food"},
				{"name": "coffee", "value": "2615", "letter": "3", "category": "food"},
			
				{"name": "soccer", "value": "26BD", "letter": "4", "category": "sport"},
				{"name": "baseball", "value": "26BE", "letter": "5", "category": "sport"},
				{"name": "basket", "value": "1F3C0", "letter": "6", "category": "sport"},
				{"name": "football", "value": "1F3C8", "letter": "7", "category": "sport"},
				{"name": "tennis", "value": "1F3BE", "letter": "8", "category": "sport"},
				{"name": "bowling", "value": "1F3B3", "letter": "9", "category": "sport"},
				{"name": "golf", "value": "26F3", "letter": "A", "category": "sport"},
				{"name": "target", "value": "1F3AF", "letter": "B", "category": "sport"},
				{"name": "skying", "value": "1F3BF", "letter": "C", "category": "sport"},
				{"name": "video", "value": "1F3AE", "letter": "D", "category": "sport"},
			
				{"name": "car", "value": "1F697", "letter": "E", "category": "travel"},
				{"name": "bicycle", "value": "1F6B2", "letter": "F", "category": "travel"},
				{"name": "train", "value": "1F685", "letter": "G", "category": "travel"},
				{"name": "airplane", "value": "2708", "letter": "H", "category": "travel"},
				{"name": "helicopter", "value": "1F681", "letter": "I", "category": "travel"},
				{"name": "boat", "value": "1F6A2", "letter": "J", "category": "travel"},
				{"name": "sailboat", "value": "26F5", "letter": "K", "category": "travel"},
				{"name": "bus", "value": "1F68C", "letter": "L", "category": "travel"},
				{"name": "tractor", "value": "1F69C", "letter": "M", "category": "travel"},
				{"name": "rocket", "value": "1F680", "letter": "N", "category": "travel"},
			
				{"name": "watch", "value": "231A", "letter": "O", "category": "things"},
				{"name": "gift", "value": "1F381", "letter": "P", "category": "things"},
				{"name": "trophey", "value": "1F3C6", "letter": "Q", "category": "things"},
				{"name": "computer", "value": "1F4BB", "letter": "R", "category": "things"},
				{"name": "television", "value": "1F4FA", "letter": "S", "category": "things"},
				{"name": "guitar", "value": "1F3B8", "letter": "T", "category": "things"},
				{"name": "book", "value": "1F4D6", "letter": "U", "category": "things"},
				{"name": "wrench", "value": "1F527", "letter": "V", "category": "things"},
				{"name": "telephone", "value": "260E", "letter": "W", "category": "things"},
				{"name": "camera", "value": "1F4F7", "letter": "X", "category": "things"}
			]
		}
	},
	mounted() {
		this.currentIndex= 0;
	},
	watch: {
		passwordValue: function(newVal, oldVal) {
			if(newVal.length>0)
				this.showCancel= true
			else
				this.showCancel= false
		},
		currentIndex: function(newVal) {
			var j=0;
			this.currentIndex= newVal;
			for (var i = newVal ; i <= newVal+9 ; i++,j++) {
				this.currentEmojis[j]= this.emojisData[i];
			}
		}
	},
	methods: {
		cancelClicked() {
			this.passwordValue=''
			this.passwordText='';
		},
		emojiClicked(e, index) {
			var element;
			if(e.target.className!='emoji') {
				element= e.target.parentNode;
			}
			else
				element= e.target;
			element.classList.add("emoji-flash");
			setTimeout(() => {
				element.classList.remove("emoji-flash");
			}, 500);
			this.$refs.password.focus();
			var emoji=this.currentEmojis[index];
			this.passwordText=this.passwordText+emoji.letter;
			this.passwordValue=this.passwordValue+String.fromCodePoint(this._convertToEmoji(emoji.letter));
		},
		keyEntered(e) {
			var key= e.key;
			var keyCode= e.keyCode;
			if(key=="Backspace") {
				if(this.passwordText=='')
					return;
				var char=this.passwordText[this.passwordText.length-1];
				this.passwordText=this.passwordText.substring(0, this.passwordText.length - 1);
				
				var lastIndex = this.passwordValue.lastIndexOf(String.fromCodePoint(this._convertToEmoji(char)));
				this.passwordValue = this.passwordValue.substring(0, lastIndex);
			}
			else if(key=="Enter") {
				this.$emit('passwordSet',this.passwordText)
				this.cancelClicked();
			}
			else if((keyCode>64 && keyCode<91) ||(keyCode>96 && keyCode<123) || (keyCode>47 && keyCode<58) ) {
				this.passwordText=this.passwordText+key;
				this.passwordValue=this.passwordValue+String.fromCodePoint(this._convertToEmoji(key));
			}
		},
		category0Clicked() {
			if(this.currentIndex==0)
				return;
			if(this.currentIndex==10) {
				this.currentIndex=0;
				this._removeAddFocus("category1","category0")
			}
			else {
				this.currentIndex= this.category1Index-10;
				this._removeAddFocus("category0","category1")
				this._removeAddFocus("category2");

				this.category0Index= this.category0Index-10;
				this.category1Index= this.category1Index-10;
				this.category2Index= this.category2Index-10;
			}
		},
		category1Clicked() {
			if(this.currentIndex==this.category1Index)
				return;
			if(this.currentIndex==0) {
				this.currentIndex=10;
				this._removeAddFocus("category0","category1")
			}
			else if(this.currentIndex==50) {
				this.currentIndex=40;
				this._removeAddFocus("category2","category1")
			}
		},
		category2Clicked() {
			if(this.currentIndex==50)
				return;
			else if(this.currentIndex==40) {
				this.currentIndex=50;
				this._removeAddFocus("category1","category2")
			}
			else {
				this.currentIndex= this.category1Index+10;
				this._removeAddFocus("category0","category1")
				this._removeAddFocus("category2");
				this.category0Index= this.category1Index;
				this.category1Index= this.category1Index+10;
				this.category2Index= this.category1Index+10;
			}
		},
		// Convert a char to an emoji code and reversly
		_convertToEmoji(char) {
			for (var i = 0 ; i < this.emojisData.length ; i++) {
				var item = this.emojisData[i];
				if (item.letter == char) {
					return "0x"+item.value;
				}
			}
			return "";
		},
		_removeAddFocus(currentFocusRef, newFocusRef) {
			this.$refs[currentFocusRef].classList.add("emoji-unselected");
			this.$refs[currentFocusRef].classList.remove("emoji-selected");
			if(newFocusRef) {
				this.$refs[newFocusRef].classList.add("emoji-selected");
				this.$refs[newFocusRef].classList.remove("emoji-unselected");
			}
		}
	}
};

if (typeof module !== 'undefined') module.exports = { Password }