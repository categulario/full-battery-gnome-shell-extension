.PHONY: clean

fullbattery.zip: locale/es/LC_MESSAGES/fullbattery.mo
	zip fullbattery.zip metadata.json extension.js locale/es/LC_MESSAGES/fullbattery.*

locale/es/LC_MESSAGES/fullbattery.mo: locale/es/LC_MESSAGES/fullbattery.po
	msgfmt -o locale/es/LC_MESSAGES/fullbattery.mo locale/es/LC_MESSAGES/fullbattery.po

clean:
	rm -f locale/*/LC_MESSAGES/*.mo
	rm -f fullbattery.zip
