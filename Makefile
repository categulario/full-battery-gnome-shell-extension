.PHONY: clean

fullbattery.zip: locale/da/LC_MESSAGES/fullbattery.mo locale/de/LC_MESSAGES/fullbattery.mo locale/es/LC_MESSAGES/fullbattery.mo locale/fr/LC_MESSAGES/fullbattery.mo locale/it/LC_MESSAGES/fullbattery.mo locale/ml/LC_MESSAGES/fullbattery.mo locale/nl/LC_MESSAGES/fullbattery.mo locale/pt_BR/LC_MESSAGES/fullbattery.mo locale/tr/LC_MESSAGES/fullbattery.mo locale/zh/LC_MESSAGES/fullbattery.mo
	zip fullbattery.zip metadata.json extension.js locale/**/LC_MESSAGES/fullbattery.*

locale/da/LC_MESSAGES/fullbattery.mo: locale/da/LC_MESSAGES/fullbattery.po
	msgfmt -o locale/da/LC_MESSAGES/fullbattery.mo locale/da/LC_MESSAGES/fullbattery.po

locale/de/LC_MESSAGES/fullbattery.mo: locale/de/LC_MESSAGES/fullbattery.po
	msgfmt -o locale/de/LC_MESSAGES/fullbattery.mo locale/de/LC_MESSAGES/fullbattery.po

locale/es/LC_MESSAGES/fullbattery.mo: locale/es/LC_MESSAGES/fullbattery.po
	msgfmt -o locale/es/LC_MESSAGES/fullbattery.mo locale/es/LC_MESSAGES/fullbattery.po

locale/fr/LC_MESSAGES/fullbattery.mo: locale/fr/LC_MESSAGES/fullbattery.po
	msgfmt -o locale/fr/LC_MESSAGES/fullbattery.mo locale/fr/LC_MESSAGES/fullbattery.po

locale/it/LC_MESSAGES/fullbattery.mo: locale/it/LC_MESSAGES/fullbattery.po
	msgfmt -o locale/it/LC_MESSAGES/fullbattery.mo locale/it/LC_MESSAGES/fullbattery.po

locale/ml/LC_MESSAGES/fullbattery.mo: locale/ml/LC_MESSAGES/fullbattery.po
	msgfmt -o locale/ml/LC_MESSAGES/fullbattery.mo locale/ml/LC_MESSAGES/fullbattery.po

locale/nl/LC_MESSAGES/fullbattery.mo: locale/nl/LC_MESSAGES/fullbattery.po
	msgfmt -o locale/nl/LC_MESSAGES/fullbattery.mo locale/nl/LC_MESSAGES/fullbattery.po

locale/pt_BR/LC_MESSAGES/fullbattery.mo: locale/pt_BR/LC_MESSAGES/fullbattery.po
	msgfmt -o locale/pt_BR/LC_MESSAGES/fullbattery.mo locale/pt_BR/LC_MESSAGES/fullbattery.po

locale/tr/LC_MESSAGES/fullbattery.mo: locale/tr/LC_MESSAGES/fullbattery.po
	msgfmt -o locale/tr/LC_MESSAGES/fullbattery.mo locale/tr/LC_MESSAGES/fullbattery.po

locale/zh/LC_MESSAGES/fullbattery.mo: locale/zh/LC_MESSAGES/fullbattery.po
	msgfmt -o locale/zh/LC_MESSAGES/fullbattery.mo locale/zh/LC_MESSAGES/fullbattery.po

clean:
	rm -f locale/*/LC_MESSAGES/*.mo
	rm -f fullbattery.zip
